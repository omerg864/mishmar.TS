/* eslint-disable prefer-const */
import {
	ConflictException,
	Injectable,
	NotFoundException
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Structure } from '../structure/structure.model';
import { Schedule } from './schedule.model';
import { addDays, getRandomIndex, numberToDay } from '../functions/functions';
import * as XLSX from 'xlsx';
import * as excel from 'excel4node';
import { User } from '../user/user.model';
import { Settings } from '../settings/settings.model';
import Dayjs from 'dayjs';
import { HebrewCalendar, Location } from '@hebcal/core';
import { ReinforcementInterface } from '../reinforcement/reinforcement.model';


export type Shift = { shift: string | Structure; days: string[] };
type dayShifts = 'morning' | 'noon' | 'night';
type ExcelWeeksData = {
	morning: { name: string; pull: boolean; seq: false }[];
	noon: { name: string; pull: boolean; seq: false }[];
	night: { name: string; pull: boolean; seq: false }[];
}[][];

@Injectable()
export class ScheduleService {
	constructor(
		@InjectModel('Schedule')
		private readonly scheduleModel: Model<Schedule>,
		@InjectModel('Structure')
		private readonly structureModel: Model<Structure>,
		@InjectModel('User') private readonly userModel: Model<User>,
		@InjectModel('Settings') private readonly settingsModel: Model<Settings>,
		@InjectModel('Reinforcement') private readonly reinforcementModel: Model<ReinforcementInterface>
	) {}

	sortStructures = (a: Shift, b: Shift) => {
		const first = a.shift as Structure;
		const second = b.shift as Structure;
		if (first.shift > second.shift) {
			return 1;
		} else if (first.shift < second.shift) {
			return -1;
		} else {
			if (first.index > second.index) {
				return 1;
			} else if (first.index < second.index) {
				return -1;
			}
		}
		return 0;
	};

	async populateSchedule(schedule: Schedule): Promise<Schedule> {
		let schedule_temp: Schedule = { ...schedule['_doc'] };
		let weeks_tmp: Shift[][] = [];
		let cache: { [id: string]: Structure | null } = { omer: null };
		for (let i = 0; i < schedule.weeks.length; i++) {
			let week_tmp: Shift[] = [];
			for (let j = 0; j < schedule.weeks[i].length; j++) {
				let structureModel: Structure;
				if (cache[schedule.weeks[i][j].shift.toString()]) {
					structureModel =
						cache[schedule.weeks[i][j].shift.toString()];
				} else {
					structureModel = await this.structureModel.findById(
						schedule.weeks[i][j].shift
					);
					cache[schedule.weeks[i][j].shift.toString()] =
						structureModel;
				}
				if (structureModel) {
					week_tmp.push({
						shift: structureModel,
						days: schedule.weeks[i][j].days,
					});
				}
			}
			week_tmp.sort(this.sortStructures);
			weeks_tmp.push(week_tmp);
		}
		schedule_temp.weeks = weeks_tmp;
		return schedule_temp;
	}

	async getScheduleShiftData(id: string) {
		let schedule_found: Schedule = await this.scheduleModel.findById(id);
		if (!schedule_found) {
			throw new NotFoundException('סידור לא נמצא');
		}
		const days = this.calculateDays(schedule_found);
		return { schedule: {weeks: schedule_found.weeks, num_weeks: schedule_found.num_weeks, date: schedule_found.date, _id: schedule_found._id, days} };
	}

	async getViewSchedule(query: {
		page?: number;
	}, userId: string): Promise<{ schedule: Schedule; pages: number, reinforcements: ReinforcementInterface[][][], events: any[] }> {
		if (!query.page || query.page <= 0) {
			query.page = 0;
		} else {
			query.page -= 1;
		}
		let all_schedules = await this.scheduleModel
			.find()
			.sort({ date: -1 })
			.limit(2);
		let count = await this.scheduleModel.find().count();
		if (all_schedules.length === 0) {
			throw new NotFoundException('לא נמצאו סידורים');
		}
		let index = 0;
		if (!all_schedules[index].publish) {
			index = 1;
			if (all_schedules.length === 1) {
				throw new ConflictException('אין סידורים מפורסמים עדיין');
			}
		}
		let pages = count - index;
		let schedule_found = await this.scheduleModel
			.findOne()
			.sort({ date: -1 })
			.skip(query.page + index);
		if (!schedule_found) {
			throw new NotFoundException('לא נמצאו סידורים');
		}
		const [reinforcements, days, schedule, user] = await Promise.all([
			this.getReinforcement(schedule_found),
			this.calculateDays(schedule_found),
			this.populateSchedule(schedule_found),
			this.userModel.findById(userId),
		]);
		const newSchedule = { ...schedule, days };
		const events = await this.getEvents(newSchedule, reinforcements, user.nickname);
		return { schedule: newSchedule, pages, reinforcements, events };
	}

	async getEvents(schedule: Schedule, reinforcements: ReinforcementInterface[][][], nickname: string) {
		let events = [];
		for (let i = 0; i < schedule.num_weeks; i++) {
			for (let j = 0; j < 7; j++) {
				if (reinforcements[i][j]) {
					for (let k = 0; k < reinforcements[i][j].length; k++) {
						const names = reinforcements[i][j][k].names.split('\n');
						for (let l = 0; l < names.length; l++) {
							if (names[l] !== nickname) {
								continue;
							}
							const date = new Date(schedule.days[i][j]);
							const start_time = this.shiftToStartTime(reinforcements[i][j][k].shift).split(':').map((x) => parseInt(x));
							const end_time = this.shiftToEndTime(reinforcements[i][j][k].shift).split(':').map((x) => parseInt(x));
							const new_date = [date.getFullYear(), date.getMonth() + 1, date.getDate(), start_time[0], start_time[1]];
							const duration_hours = end_time[0] > start_time[0] ? end_time[0] - start_time[0] : 24 - start_time[0] + end_time[0] - 1;
							const duration_minutes = end_time[0] > start_time[0] ? end_time[1] - start_time[1] : 60 - start_time[1] + end_time[1];
							events.push({
								title: `משמרת ${this.numberToShift(reinforcements[i][j][k].shift)}`,
								start: new_date,
								duration: {hours: duration_hours, minutes: duration_minutes},
								location: `בית משפט ${reinforcements[i][j][k].where}`,
								attendees: names.filter((name) => name !== nickname).map((name) => ({ name })),
							});
						}
					}
				}
			}
		}
		const shifts = [];
		for (let i = 0; i < schedule.weeks.length; i++) {
			for (let j = 0; j < schedule.weeks[i].length; j++) {
				const shift = schedule.weeks[i][j];
				for (let k = 0; k < shift.days.length; k++) {
					const names = shift.days[k].split('\n');
					for (let l = 0; l < names.length; l++) {
						if (names[l] !== nickname) {
							continue;
						}
						if (shift.shift) {
							shifts.push({ shift: (shift.shift as Structure).shift, week: i, day: k });
							const date = new Date(schedule.days[i][k]);
							const start_time = (shift.shift as Structure).start_time.split(':').map((x) => parseInt(x));
							const end_time = (shift.shift as Structure).end_time.split(':').map((x) => parseInt(x));
							const new_date = [date.getFullYear(), date.getMonth() + 1, date.getDate() , start_time[0], start_time[1]];
							const duration_hours = end_time[0] > start_time[0] ? end_time[0] - start_time[0] : 24 - start_time[0] + end_time[0] - 1;
							const duration_minutes = end_time[0] > start_time[0] ? end_time[1] - start_time[1] : 60 - start_time[1] + end_time[1];
							events.push({
								id: `${i}-${k}-${(shift.shift as Structure).shift}`,
								title: `משמרת ${this.numberToShift((shift.shift as Structure).shift)}`,
								start: new_date,
								duration: {hours: duration_hours, minutes: duration_minutes},
								location: `בית משפט רמלה`,
								attendees: []
							});
						}
					}
				}
			}
		}
		for (let i = 0; i < shifts.length; i++) {
			const shift = shifts[i];
			const shifts_week = schedule.weeks[shift.week];
			for (let j = 0; j < shifts_week.length; j++) {
				const shift_tmp = shifts_week[j];
				const event = events.find((event) => event.id === `${shift.week}-${shift.day}-${(shift_tmp.shift as Structure).shift}`);
				if (event) {
					const names = shift_tmp.days[shift.day].split('\n');
					for (let k = 0; k < names.length; k++) {
						if (names[k] !== nickname && names[k] !== '') {
							event.attendees.push({ name: names[k] });
						}
					}
				}
			}
		}
		return events.map((event) => ({...event, id: undefined, description: event.attendees.map((attendee) => attendee.name).join(', ')}));
	}

	numberToShift(num: number): string {
		switch (num) {
			case 0:
				return 'בוקר';
			case 1:
				return 'צהריים';
			case 2:
				return 'לילה';
			default:
				return '';
		}
	}

	shiftToStartTime(num: number): string {
		switch (num) {
			case 0:
				return '07:00';
			case 1:
				return '15:00';
			case 2:
				return '23:00';
			default:
				return '';
		}
	}

	shiftToEndTime(num: number): string {
		switch (num) {
			case 0:
				return '15:00';
			case 1:
				return '23:00';
			case 2:
				return '07:00';
			default:
				return '';
		}
	}

	async getReinforcement(schedule: Schedule): Promise<ReinforcementInterface[][][]> {
		let reinforcements:ReinforcementInterface[][][] = [];
		let reinforcements_found = await this.reinforcementModel.find({
			schedule: schedule._id,
		}).sort({ week: 1, day: 1 });
		for (let i = 0; i < (schedule.num_weeks as unknown as number); i++) {
			reinforcements.push([]);
			for (let j = 0; j < 7; j++) {
				reinforcements[i].push([]);
				let found = reinforcements_found.filter((reinforcement) => reinforcement.week === i && reinforcement.day === j);
				if (found.length > 0) {
					reinforcements[i][j] = found as ReinforcementInterface[];
				} else {
					reinforcements[i][j] = null;
				}
			}
		}
		return reinforcements;
	}

	async getAll(query: {
		page?: number;
	}): Promise<{ schedules: Schedule[]; pages: number }> {
		if (!query.page || query.page <= 0) {
			query.page = 0;
		} else {
			query.page -= 1;
		}
		let scheduleCount = await this.scheduleModel.find().count();
		const pages = scheduleCount > 0 ? Math.ceil(scheduleCount / 5) : 1;
		let schedules = await this.scheduleModel
			.find()
			.sort({ date: -1 })
			.skip(query.page * 5)
			.limit(5)
			.select('-weeks');
		return { schedules, pages };
	}

	async getLast(): Promise<Schedule> {
		let schedules = await this.scheduleModel
			.find()
			.sort({ date: -1 })
			.select('-weeks');
		if (schedules.length === 0) {
			throw new ConflictException('לא נמצאו סידורים');
		}
		let days: Date[][] = this.calculateDays(schedules[0]);
		return { ...schedules[0]['_doc'], days };
	}

	async getLastData(): Promise<Schedule> {
		let schedules = await this.scheduleModel.find().sort({ date: -1 });
		if (schedules.length === 0) {
			throw new ConflictException('לא נמצאו סידורים');
		}
		let index = 0;
		if (!schedules[index].publish) {
			index = 1;
			if (schedules.length === 1) {
				throw new ConflictException('אין סידורים מפורסמים עדיין');
			}
		}
		let days: Date[][] = this.calculateDays(schedules[index]);
		let schedule = await this.populateSchedule(schedules[index]);
		return { ...schedule, days };
	}

	calculateDays(schedule: Schedule): Date[][] {
		let days_tmp: Date[][] = [];
		let firstDate = new Date(schedule.date);
		for (let j = 0; j < schedule.num_weeks; j++) {
			days_tmp[j] = [];
			for (let i = j * 7; i < (j + 1) * 7; i++) {
				days_tmp[j].push(addDays(firstDate, i));
			}
		}
		return days_tmp;
	}

	arrayDuplicates = (arr: string[]): string[] => {
		return arr.filter((item, index) => arr.indexOf(item) != index);
	};

	toShiftNamesArray = (shifts: Shift[], day: number): string[] => {
		let names: string[] = [];
		for (let i = 0; i < shifts.length; i++) {
			names.push(
				...shifts[i].days[day].split('\n').filter((x) => x.length > 0)
			);
		}
		return names;
	};

	compareTwoArrays(arr1: string[], arr2: string[]) {
		let names: string[] = [];
		for (let i = 0; i < arr1.length; i++) {
			if (!arr2.every((x: string) => x !== arr1[i])) {
				names.push(arr1[i]);
			}
		}
		return names;
	}

	getEndShiftExcel(
		ws: XLSX.WorkSheet,
		cell: { v?: string } | undefined,
		index: number,
		stop: string
	): { cell: { v?: string } | undefined; index: number } {
		while (cell) {
			index += 1;
			cell = ws[`A${index}`];
			if (stop === '') {
				if (!cell) {
					return { cell, index };
				}
			} else {
				if (cell.v === stop) {
					return { cell, index };
				}
			}
			if (index === 1000) {
				throw new ConflictException('שינוי במבנה קובץ אקסל');
			}
		}
	}

	getEmptyWeeksArrayShifts(num_weeks: number): ExcelWeeksData {
		let weeks: {
			morning: { name: string; pull: boolean; seq: false }[];
			noon: { name: string; pull: boolean; seq: false }[];
			night: { name: string; pull: boolean; seq: false }[];
		}[][] = [];
		for (let i = 0; i < num_weeks; i++) {
			weeks.push([]);
			for (let j = 0; j < 7; j++) {
				weeks[i].push({ morning: [], noon: [], night: [] });
			}
		}
		return weeks;
	}

	searchExcelShift(
		ws: XLSX.WorkSheet,
		start: number,
		end: number,
		column: number,
		week: number,
		day: number,
		extractedData: ExcelWeeksData,
		shift: dayShifts
	): ExcelWeeksData {
		for (let j = start; j <= end; j++) {
			// j - row number morning
			let cell = ws[`${excel.getExcelAlpha(column)}${j}`];
			if (cell?.s?.fgColor?.rgb === 'C6EFCE') {
				extractedData[week][day][shift].push({
					name: cell?.v as string,
					pull: true,
					seq: false,
				});
			}
			if (cell?.s?.fgColor?.rgb === 'FFEB9C') {
				extractedData[week][day][shift].push({
					name: cell?.v as string,
					pull: false,
					seq: false,
				});
			}
		}
		return extractedData;
	}

	extractDataFromExcel(
		file: Express.Multer.File,
		num_weeks: number
	): ExcelWeeksData {
		/* 
        ws[<ColCharRow>].v == value 
        ws[<ColCharRow>].s.fgColor == cell color 
        excel.getExcelAlpha(number); == excel number to char
        green color - C6EFCE
        orange color - FFEB9C
        */
		const fileRead = XLSX.read(file.buffer, {
			type: 'buffer',
			cellStyles: true,
		});
		const ws = fileRead.Sheets['Sheet1'];
		if (!ws) {
			throw new NotFoundException('שם העמוד צריך להיות Sheet1');
		}
		let endNames = { morning: 5, noon: 5, night: 5 };
		let temps = { cell: ws.A5, index: 5 };
		temps = this.getEndShiftExcel(ws, temps.cell, temps.index, 'צהריים');
		endNames.morning = temps.index - 1;
		temps = this.getEndShiftExcel(ws, temps.cell, temps.index, 'לילה');
		endNames.noon = temps.index - 1;
		temps = this.getEndShiftExcel(ws, temps.cell, temps.index, '');
		endNames.night = temps.index - 1;
		let extractedData = this.getEmptyWeeksArrayShifts(num_weeks);
		let weekNumber = 0;
		for (let i = 2; i < num_weeks * 7 + 2; i++) {
			// i - col number
			if ((weekNumber === 0 ? i - 1 : i) % 8 === 0) weekNumber += 1;
			let day = i - 2 - weekNumber * 7;
			extractedData = this.searchExcelShift(
				ws,
				5,
				endNames.morning,
				i,
				weekNumber,
				day,
				extractedData,
				'morning'
			);
			extractedData = this.searchExcelShift(
				ws,
				endNames.morning + 1,
				endNames.noon,
				i,
				weekNumber,
				day,
				extractedData,
				'noon'
			);
			extractedData = this.searchExcelShift(
				ws,
				endNames.noon + 1,
				endNames.night,
				i,
				weekNumber,
				day,
				extractedData,
				'night'
			);
		}
		return extractedData;
	}

	assignToShifts(
		shiftType: dayShifts,
		shifts: Shift[],
		data: ExcelWeeksData,
		inShift: string[],
		day: number,
		week: number,
		managers_names: string[],
		weeks_tmp: Shift[][],
		settings: Settings
	) {
		let managerShifts = shifts.filter(
			(structure) => (structure.shift as Structure).manager
		);
		if (
			this.compareTwoArrays(
				managers_names,
				data[week][day][shiftType].map((user) => user.name)
			).length
		) {
			let temp_names = this.compareTwoArrays(
				managers_names,
				data[week][day][shiftType].map((user) => user.name)
			);
			for (let k = 0; k < managerShifts.length; k++) {
				if (temp_names.length !== 0) {
					let rndIndex = getRandomIndex(temp_names.length);
					weeks_tmp[week] = weeks_tmp[week].map((shift) => {
						if (
							(shift.shift as Structure)._id ===
							(managerShifts[k].shift as Structure)._id
						) {
							let split = shift.days[day]
								.split('\n')
								.filter((name) => name != '');
							split.push(temp_names[rndIndex]);
							shift.days[day] = split.join('\n');
							inShift.push(temp_names[rndIndex]);
							data[week][day][shiftType] = data[week][day][
								shiftType
							].filter(
								(user) => user.name !== temp_names[rndIndex]
							);
							temp_names = temp_names.filter(
								(_, index) => index !== rndIndex
							);
						}
						return shift;
					});
				}
			}
		} else if (
			data[week][day][shiftType].filter(
				(user) => user.name === settings.officer
			).length &&
			managerShifts.length &&
			settings.officer
		) {
			weeks_tmp[week] = weeks_tmp[week].map((shift) => {
				if (
					(shift.shift as Structure)._id ===
					(managerShifts[0].shift as Structure)._id
				) {
					let split = shift.days[day]
						.split('\n')
						.filter((name) => name != '');
					split.push(settings.officer);
					shift.days[day] = split.join('\n');
					inShift.push(settings.officer);
					data[week][day][shiftType] = data[week][day][
						shiftType
					].filter((user) => user.name !== settings.officer);
				}
				return shift;
			});
		}
		if (data[week][day][shiftType].length > 0) {
			let openingShifts = shifts.filter(
				(structure) => (structure.shift as Structure).opening
			);
			let temp_names = data[week][day][shiftType].filter(
				(user) => !managers_names.includes(user.name)
			);
			if (temp_names.length < openingShifts.length) {
				temp_names = data[week][day][shiftType];
			}
			for (let k = 0; k < openingShifts.length; k++) {
				let rndIndex = getRandomIndex(temp_names.length);
				weeks_tmp[week] = weeks_tmp[week].map((shift) => {
					if (
						(shift.shift as Structure)._id ===
						(openingShifts[k].shift as Structure)._id
					) {
						let split = shift.days[day]
							.split('\n')
							.filter((name) => name != '');
						split.push(temp_names[rndIndex].name);
						shift.days[day] = split.join('\n');
						inShift.push(temp_names[rndIndex].name);
						data[week][day][shiftType] = data[week][day][
							shiftType
						].filter(
							(user) => user.name !== temp_names[rndIndex].name
						);
						temp_names = temp_names.filter(
							(_, index) => index !== rndIndex
						);
					}
					return shift;
				});
			}
		}
		if (data[week][day][shiftType].length > 0) {
			let temp_names = data[week][day][shiftType].filter(
				(user) => user.pull
			);
			if (temp_names.length > 0) {
				let pullShifts = shifts.filter(
					(structure) => (structure.shift as Structure).pull
				);
				for (let k = 0; k < pullShifts.length; k++) {
					let rndIndex = getRandomIndex(temp_names.length);
					weeks_tmp[week] = weeks_tmp[week].map((shift) => {
						if (
							(shift.shift as Structure)._id ===
							(pullShifts[k].shift as Structure)._id
						) {
							let split = shift.days[day]
								.split('\n')
								.filter((name) => name != '');
							split.push(temp_names[rndIndex].name);
							shift.days[day] = split.join('\n');
							inShift.push(temp_names[rndIndex].name);
							data[week][day][shiftType] = data[week][day][
								shiftType
							].filter(
								(user) =>
									user.name !== temp_names[rndIndex].name
							);
							temp_names = temp_names.filter(
								(_, index) => index !== rndIndex
							);
						}
						return shift;
					});
				}
			}
		}
		if (data[week][day][shiftType].length > 0) {
			let shiftsLeft = shifts.filter(
				(shift) =>
					!(shift.shift as Structure).pull &&
					!(shift.shift as Structure).manager &&
					!(shift.shift as Structure).opening
			);
			for (let k = 0; k < shiftsLeft.length; k++) {
				if (data[week][day][shiftType].length === 0) break;
				if (k === shiftsLeft.length - 1) {
					let tempData = [...data[week][day][shiftType]];
					for (let u = 0; u < tempData.length; u++) {
						weeks_tmp[week] = weeks_tmp[week].map((shift) => {
							if (
								(shift.shift as Structure)._id ===
								(shiftsLeft[k].shift as Structure)._id
							) {
								let split = shift.days[day]
									.split('\n')
									.filter((name) => name != '');
								split.push(tempData[u].name);
								shift.days[day] = split.join('\n');
								inShift.push(tempData[u].name);
								data[week][day][shiftType] = data[week][day][
									shiftType
								].filter(
									(user) => user.name !== tempData[u].name
								);
							}
							return shift;
						});
					}
				} else {
					let rndIndex = getRandomIndex(
						data[week][day][shiftType].length
					);
					weeks_tmp[week] = weeks_tmp[week].map((shift) => {
						if (
							(shift.shift as Structure)._id ===
							(shiftsLeft[k].shift as Structure)._id
						) {
							let split = shift.days[day]
								.split('\n')
								.filter((name) => name != '');
							split.push(
								data[week][day][shiftType][rndIndex].name
							);
							shift.days[day] = split.join('\n');
							inShift.push(
								data[week][day][shiftType][rndIndex].name
							);
							data[week][day][shiftType] = data[week][day][
								shiftType
							].filter(
								(user) =>
									user.name !==
									data[week][day][shiftType][rndIndex].name
							);
						}
						return shift;
					});
				}
			}
		}
		return { data, inShift, weeks_tmp };
	}

	async excelToSchedule(files: Express.Multer.File[], scheduleId: string) {
		if (!files[0]) {
			throw new NotFoundException('אין קובץ');
		}
		const schedule = await this.scheduleModel.findById(scheduleId);
		if (!schedule) {
			throw new NotFoundException('לא נמצא סידור');
		}
		let weeks_tmp: Shift[][] = [];
		for (let i = 0; i < schedule.weeks.length; i++) {
			let week_tmp: Shift[] = [];
			for (let j = 0; j < schedule.weeks[i].length; j++) {
				let structureModel = await this.structureModel.findById(
					schedule.weeks[i][j].shift
				);
				if (structureModel) {
					week_tmp.push({
						shift: structureModel,
						days: ['', '', '', '', '', '', ''],
					});
				}
			}
			week_tmp.sort(this.sortStructures);
			weeks_tmp.push(week_tmp);
		}
		let managers = await this.userModel.find({
			username: { $ne: 'admin' },
			role: 'SHIFT_MANAGER',
		});
		let settings = await this.settingsModel.findOne();
		let managers_names = managers.map((user) => user.nickname);
		let extractedData;
		try {
			extractedData = this.extractDataFromExcel(
				files[0],
				schedule.num_weeks
			);
		} catch (error) {
			console.log(error);
			throw new ConflictException('שגיאה בקריאת הקובץ', error.message);
		}
		try {
			for (let i = 0; i < extractedData.length; i++) {
				// i - week number
				let morningShifts = weeks_tmp[i].filter(
					(structure) => (structure.shift as Structure).shift === 0
				);
				let noonShifts = weeks_tmp[i].filter(
					(structure) => (structure.shift as Structure).shift === 1
				);
				let nightShifts = weeks_tmp[i].filter(
					(structure) => (structure.shift as Structure).shift === 2
				);
				for (let j = 0; j < extractedData[i].length; j++) {
					// j - day number
					let inShift: string[] = [];
					let assigned = this.assignToShifts(
						'morning',
						morningShifts,
						extractedData,
						inShift,
						j,
						i,
						managers_names,
						weeks_tmp,
						settings
					);
					extractedData = assigned.data;
					inShift = assigned.inShift;
					weeks_tmp = assigned.weeks_tmp;
					assigned = this.assignToShifts(
						'noon',
						noonShifts,
						extractedData,
						inShift,
						j,
						i,
						managers_names,
						weeks_tmp,
						settings
					);
					extractedData = assigned.data;
					inShift = assigned.inShift;
					weeks_tmp = assigned.weeks_tmp;
					assigned = this.assignToShifts(
						'night',
						nightShifts,
						extractedData,
						inShift,
						j,
						i,
						managers_names,
						weeks_tmp,
						settings
					);
					extractedData = assigned.data;
					inShift = assigned.inShift;
					weeks_tmp = assigned.weeks_tmp;
				}
			}
		} catch (error) {
			throw new ConflictException(
				'שגיאה בהכנסת הנתונים לסידור',
				error.message
			);
		}
		schedule.weeks = weeks_tmp;
		await schedule.save();
		return {
			message: 'success',
		};
	}

	async scheduleTable(id: string): Promise<{
		counts: {
			name: string;
			night: number;
			weekend: number;
			[key: string]: number | string;
		}[];
		total: { night: number; weekend: number; [key: string]: number };
		weeksKeys: string[];
	}> {
		let schedule: Schedule = await this.scheduleModel.findById(id);
		if (!schedule) {
			throw new NotFoundException('סידור לא נמצא');
		}
		let reinforcements;
		await this.scheduleModel.find({
			schedule: schedule._id
		});
		[reinforcements, schedule] = await Promise.all([
			this.reinforcementModel.find({
				schedule: schedule._id
			}),
			this.populateSchedule(schedule)
		])
		let counts: {
			name: string;
			night: number;
			weekend: number;
			[key: string]: number | string;
		}[] = [];
		let total: { night: number; weekend: number; [key: string]: number } = {
			night: 0,
			weekend: 0,
		};
		let names: string[] = [];
		let resetObj: { [key: string]: number } = {};
		for (let i = 0; i < schedule.num_weeks; i++) {
			resetObj[`morning${i}`] = 0;
			resetObj[`noon${i}`] = 0;
			total[`morning${i}`] = 0;
			total[`noon${i}`] = 0;
		}
		for (let i = 0; i < schedule.weeks.length; i++) {
			// i - week number
			for (let j = 0; j < schedule.weeks[i].length; j++) {
				// j - shift number
				let structure = schedule.weeks[i][j].shift as Structure;
				for (let k = 0; k < schedule.weeks[i][j].days.length; k++) {
					// k - day number
					let shift_names = schedule.weeks[i][j].days[k]
						.split('\n')
						.filter((name) => name !== '');
					for (let l = 0; l < shift_names.length; l++) {
						// l - name number
						if (!names.includes(shift_names[l])) {
							names.push(shift_names[l]);
							counts.push({
								name: shift_names[l],
								night: 0,
								weekend: 0,
								...resetObj,
							});
						}
						let index = names.indexOf(shift_names[l]);
						switch (structure.shift) {
							case 0:
								if (k !== 6) {
									counts[index][`morning${i}`] =
										+counts[index][`morning${i}`] + 1;
									total[`morning${i}`] += 1;
								} else {
									counts[index].weekend += 1;
									total.weekend += 1;
								}
								break;

							case 1:
								if (k < 5) {
									counts[index][`noon${i}`] =
										+counts[index][`noon${i}`] + 1;
									total[`noon${i}`] += 1;
								} else {
									counts[index].weekend += 1;
									total.weekend += 1;
								}
								break;

							case 2:
								if (k < 5) {
									counts[index].night += 1;
									total.night += 1;
								} else {
									counts[index].weekend += 1;
									total.weekend += 1;
								}
								break;
						}
					}
				}
			}
		}
		for(let i = 0; i < reinforcements.length; i++) {
			if (!reinforcements[i]) {
				continue;
			}
			const names_re = reinforcements[i].names.split('\n');
			const shift = reinforcements[i].shift;
			const day = reinforcements[i].day;
			for(let j = 0; j < names_re.length; j++) {
				if (!names.includes(names_re[j])) {
					names.push(names_re[j]);
					counts.push({
						name: names_re[j],
						night: 0,
						weekend: 0,
						...resetObj,
					});
				}
				const index = names.indexOf(names_re[j]);
				switch (shift) {
					case 0:
						if (day !== 6) {
							counts[index][`morning${i}`] =
								+counts[index][`morning${i}`] + 1;
							total[`morning${i}`] += 1;
						} else {
							counts[index].weekend += 1;
							total.weekend += 1;
						}
						break;

					case 1:
						if (day < 5) {
							counts[index][`noon${i}`] =
								+counts[index][`noon${i}`] + 1;
							total[`noon${i}`] += 1;
						} else {
							counts[index].weekend += 1;
							total.weekend += 1;
						}
						break;

					case 2:
						if (day < 5) {
							counts[index].night += 1;
							total.night += 1;
						} else {
							counts[index].weekend += 1;
							total.weekend += 1;
						}
						break;
				}
			}
		}
		return { counts, total, weeksKeys: Object.keys(resetObj) };
	}

	async scheduleValid(weeks: Shift[][]): Promise<string[]> {
		let notifications: Set<string> = new Set();
		for (let i = 0; i < weeks.length; i++) {
			// i - week number
			let morningShifts = weeks[i].filter(
				(shift) => (shift.shift as Structure).shift === 0
			);
			let noonShifts = weeks[i].filter(
				(shift) => (shift.shift as Structure).shift === 1
			);
			let nightShifts = weeks[i].filter(
				(shift) => (shift.shift as Structure).shift === 2
			);
			for (let j = 0; j < 7; j++) {
				// j - day number
				let morningNames = this.toShiftNamesArray(morningShifts, j);
				let noonNames = this.toShiftNamesArray(noonShifts, j);
				let nightNames = this.toShiftNamesArray(nightShifts, j);
				let duplicates = this.arrayDuplicates(morningNames);
				for (let k = 0; k < duplicates.length; k++) {
					// k - duplicate name index
					notifications.add(
						`ביום ${numberToDay(j)} בשבוע ה-${i + 1} ${
							duplicates[k]
						} באותה משמרת בוקר כמה פעמים`
					);
				}
				duplicates = this.arrayDuplicates(noonNames);
				for (let k = 0; k < duplicates.length; k++) {
					// k - duplicate name index
					notifications.add(
						`ביום ${numberToDay(j)} בשבוע ה-${i + 1} ${
							duplicates[k]
						} באותה משמרת צהריים כמה פעמים`
					);
				}
				duplicates = this.arrayDuplicates(nightNames);
				for (let k = 0; k < duplicates.length; k++) {
					// k - duplicate name index
					notifications.add(
						`ביום ${numberToDay(j)} בשבוע ה-${i + 1} ${
							duplicates[k]
						} באותה משמרת לילה כמה פעמים`
					);
				}
				duplicates = this.compareTwoArrays(morningNames, noonNames);
				for (let k = 0; k < duplicates.length; k++) {
					// k - duplicate name index
					notifications.add(
						`ביום ${numberToDay(j)} בשבוע ה-${i + 1} ${
							duplicates[k]
						} במשמרת בוקר ואז צהריים`
					);
				}
				duplicates = this.compareTwoArrays(noonNames, nightNames);
				for (let k = 0; k < duplicates.length; k++) {
					// k - duplicate name index
					notifications.add(
						`ביום ${numberToDay(j)} בשבוע ה-${i + 1} ${
							duplicates[k]
						} במשמרת צהריים ואז לילה`
					);
				}
				if (j !== 6) {
					morningNames = this.toShiftNamesArray(morningShifts, j + 1);
					duplicates = this.compareTwoArrays(
						nightNames,
						morningNames
					);
					for (let k = 0; k < duplicates.length; k++) {
						// k - duplicate name index
						notifications.add(
							`ביום ${numberToDay(j)} בשבוע ה-${i + 1} ${
								duplicates[k]
							} במשמרת לילה ואז בוקר`
						);
					}
				} else {
					if (i !== weeks.length - 1) {
						morningShifts = weeks[i + 1].filter(
							(shift) => (shift.shift as Structure).shift === 0
						);
						morningNames = this.toShiftNamesArray(morningShifts, 0);
						duplicates = this.compareTwoArrays(
							nightNames,
							morningNames
						);
						for (let k = 0; k < duplicates.length; k++) {
							// k - duplicate name index
							notifications.add(
								`ביום ${numberToDay(j)} בשבוע ה-${i + 1} ${
									duplicates[k]
								} במשמרת לילה ואז בוקר`
							);
						}
					}
				}
			}
		}
		return [...notifications];
	}

	async getSchedule(id: string): Promise<{schedule: Schedule, reinforcements: ReinforcementInterface[][][]}> {
		let schedule_found: Schedule = await this.scheduleModel.findById(id);
		if (!schedule_found) {
			throw new NotFoundException('סידור לא נמצא');
		}
		const [reinforcements, schedule, days] = await Promise.all([
			this.getReinforcement(schedule_found),
			this.populateSchedule(schedule_found),
			this.calculateDays(schedule_found),
		]);
		return { schedule: {...schedule, days}, reinforcements };
	}

	async getShifts(date: { month: number; year: number }) {
		const shifts = {};
		const startDate = Dayjs(new Date(date.year, date.month, 1))
			.subtract(14, 'day')
			.toDate();
		const endDate = new Date(date.year, date.month, 32);
		const schedules = await this.scheduleModel.find({
			date: { $gte: startDate, $lte: endDate },
		});
		const location = Location.lookup('Tel Aviv');
		const holiday_eve = 'Candle lighting';
		const holiday_end = 'Havdalah';
		const structures = await this.structureModel.find();
		const structs = {};
		for (let i = 0; i < structures.length; i++) {
			structs[structures[i]._id.toString()] = structures[i];
		}
		for (let i = 0; i < schedules.length; i++) {
			for (let j = 0; j < schedules[i].weeks.length; j++) {
				for (let k = 0; k < schedules[i].weeks[j].length; k++) {
					const shift = schedules[i].weeks[j][k];
					if (!structs[shift.shift as string]) {
						continue;
					}
					const shiftType = structs[shift.shift as string].shift;
					if (shiftType === 3) {
						continue;
					}
					for (let l = 0; l < shift.days.length; l++) {
						const names = shift.days[l]
							.split('\n')
							.filter((x) => x.length > 0);
						const dateShift = Dayjs(schedules[i].date)
							.hour(3)
							.add(j, 'week')
							.add(l, 'day');
						const day = dateShift.day();
						const options = {
							start: dateShift.toDate(),
							end: dateShift.toDate(),
							location,
							candlelighting: true,
							noHolidays: true
						};
						let holiday = 0;
						const events = HebrewCalendar.calendar(options);
						if (events && events.length > 0) {
							for (let i = 0; i < events.length; i++) {
								if (events[i].desc === holiday_eve) {
									holiday = 1;
									break;
								}
								if (events[i].desc === holiday_end) {
									holiday = 2;
									break;
								}
							}
						}

						for (let m = 0; m < names.length; m++) {
							if (!shifts[names[m]]) {
								shifts[names[m]] = {
									nickname: names[m],
									morning: 0,
									noon: 0,
									night: 0,
									friday_noon: 0,
									weekend_night: 0,
									weekend_day: 0,
									morning_re: 0,
									noon_re: 0,
									night_re: 0,
									friday_noon_re: 0,
									weekend_night_re: 0,
									weekend_day_re: 0,
								};
							}
							if (dateShift.month() === date.month) {
								if (holiday) {
									if (holiday === 1 && shiftType === 0) {
										shifts[names[m]].morning += 1;
										continue;
									}
									if (holiday === 1 && shiftType === 1) {
										shifts[names[m]].friday_noon += 1;
										continue;
									}
									if (shiftType === 0 || shiftType === 1) 
									{
										shifts[names[m]].weekend_day += 1;
										continue;
									}
									if (shiftType === 2) {
										shifts[names[m]].weekend_night += 1;
										continue;
									}
								}
								if (day <= 5 && shiftType === 0) {
									shifts[names[m]].morning += 1;
									continue;
								}
								if (day < 5 && shiftType === 1) {
									shifts[names[m]].noon += 1;
									continue;
								}
								if (day < 5 && shiftType === 2) {
									shifts[names[m]].night += 1;
									continue;
								}
								if (day === 5 && shiftType === 1) {
									shifts[names[m]].friday_noon += 1;
								}
								if (
									day === 6 &&
									(shiftType === 0 || shiftType === 1)
								) {
									shifts[names[m]].weekend_day += 1;
								}
								if (
									(day === 6 || day === 5) &&
									shiftType === 2
								) {
									shifts[names[m]].weekend_night += 1;
								}
							}
						}
					}
				}
			}
		}
		for (let i = 0; i < schedules.length; i++) {
			let reinforcements = await this.getReinforcement(schedules[i]);
			for (let j = 0; j < reinforcements.length; j++) {
				for (let k = 0; k < reinforcements[j].length; k++) {
					const dateShift = Dayjs(schedules[i].date)
							.hour(3)
							.add(j, 'week')
							.add(k, 'day');
					const day = dateShift.day();
					if (reinforcements[j][k] && dateShift.month() === date.month) {
						const options = {
							start: dateShift.toDate(),
							end: dateShift.toDate(),
							location,
							candlelighting: true,
							noHolidays: true
						};
						let holiday = 0;
						const events = HebrewCalendar.calendar(options);
						if (events && events.length > 0) {
							for (let i = 0; i < events.length; i++) {
								if (events[i].desc === holiday_eve) {
									holiday = 1;
									break;
								}
								if (events[i].desc === holiday_end) {
									holiday = 2;
									break;
								}
							}
						}
						for (let l = 0; l < reinforcements[j][k].length; l++) {
							let shiftType = reinforcements[j][k][l].shift;
							let names = reinforcements[j][k][l].names.split('\n');
							for (let t = 0; t < names.length; t++) {
								if (!shifts[names[t]]) {
									shifts[names[t]] = {
										nickname: names[t],
										morning: 0,
										noon: 0,
										night: 0,
										friday_noon: 0,
										weekend_night: 0,
										weekend_day: 0,
										morning_re: 0,
										noon_re: 0,
										night_re: 0,
										friday_noon_re: 0,
										weekend_night_re: 0,
										weekend_day_re: 0,
									};
								}
								if (holiday) {
									if (holiday === 1 && shiftType === 0) {
										shifts[names[t]].morning_re += 1;
										continue;
									}
									if (holiday === 1 && shiftType === 1) {
										shifts[names[t]].friday_noon_re += 1;
										continue;
									}
									if (shiftType === 0 || shiftType === 1) 
									{
										shifts[names[t]].weekend_day_re += 1;
										continue;
									}
									if (shiftType === 2) {
										shifts[names[t]].weekend_night_re += 1;
										continue;
									}
								}
								if (day <= 5 && shiftType === 0) {
									shifts[names[t]].morning_re += 1;
									continue;
								}
								if (day < 5 && shiftType === 1) {
									shifts[names[t]].noon_re += 1;
									continue;
								}
								if (day < 5 && shiftType === 2) {
									shifts[names[t]].night_re += 1;
									continue;
								}
								if (day === 5 && shiftType === 1) {
									shifts[names[t]].friday_noon_re += 1;
								}
								if (
									day === 6 &&
									(shiftType === 0 || shiftType === 1)
								) {
									shifts[names[t]].weekend_day_re += 1;
								}
								if (
									(day === 6 || day === 5) && shiftType === 2 ) {
										shifts[names[t]].weekend_night_re += 1;
									}
							}
						}
					}
				}
			}
		}
		return shifts;
	}

	async create(schedule: Schedule): Promise<Schedule> {
		const rows = await this.structureModel
			.find()
			.sort({ shift: 1, index: 1 });
		let weeks: Shift[][] = [];
		for (let i = 0; i < schedule.num_weeks; i++) {
			weeks[i] = [];
			for (let j = 0; j < rows.length; j++) {
				weeks[i].push({
					shift: rows[j]._id.toString(),
					days: ['', '', '', '', '', '', ''],
				});
			}
		}
		return await this.scheduleModel.create({ ...schedule, weeks });
	}

	async update(schedule: Schedule, reinforcements: ReinforcementInterface[], deletedReinforcements: ReinforcementInterface[], reset: boolean): Promise<{ success: boolean, reinforcements: ReinforcementInterface[] }> {
		let scheduleFound = await this.scheduleModel.findById(schedule._id);
		if (!scheduleFound) {
			throw new NotFoundException('סידור לא נמצא');
		}
		let scheduleUpdate, reinforcementsUpdate;
		let newReinforcements;
		if (!reset) {
			[scheduleUpdate, reinforcementsUpdate] = await Promise.all([
				this.scheduleModel.findByIdAndUpdate(
					schedule._id,
					schedule
				),
				this.createAndUpdateReinforcements(reinforcements, schedule),
				this.deleteReinforcements(deletedReinforcements)
			]);
			newReinforcements = await this.getReinforcement(scheduleFound);
		} else {
			[scheduleUpdate, reinforcementsUpdate] = await Promise.all([
				this.scheduleModel.findByIdAndUpdate(
					schedule._id,
					schedule
				),
				this.reinforcementModel.deleteMany({ schedule: schedule._id })
			]);
			newReinforcements = []
		}
		if (!scheduleUpdate || !reinforcementsUpdate.success) {
			if (reset) {
				newReinforcements = await this.getReinforcement(scheduleFound);
			}
			return { success: false, reinforcements: newReinforcements };
		}
		return { success: true, reinforcements: newReinforcements };
	}

	async createAndUpdateReinforcements(
		reinforcements: ReinforcementInterface[],
		schedule: Schedule
	): Promise<{ success: boolean }> {
		let promises = [];
		for (let i = 0; i < reinforcements.length; i++) {
			if (reinforcements[i]._id) {
				promises.push(this.updateReinforcement(reinforcements[i]));
			} else {
				promises.push(this.createReinforcement(reinforcements[i], schedule));
			}
		}
		await Promise.all(promises);
		return { success: true };
	}

	async deleteReinforcements(reinforcements: ReinforcementInterface[]): Promise<{ success: boolean }> {
		let promises = [];
		for (let i = 0; i < reinforcements.length; i++) {
			promises.push(this.reinforcementModel.findByIdAndDelete(reinforcements[i]._id));
		}
		await Promise.all(promises);
		return { success: true };
	}

	async updateReinforcement(
		reinforcement: ReinforcementInterface
	): Promise<{ success: boolean }> {
		let reinforcement_found = await this.reinforcementModel.findById(
			reinforcement._id
		);
		if (!reinforcement_found) {
			return { success: false };
		}
		await this.reinforcementModel.findByIdAndUpdate(
			reinforcement._id,
			reinforcement
		);
		return { success: true };
	}

	async createReinforcement(
		reinforcement: ReinforcementInterface,
		schedule: Schedule
	): Promise<ReinforcementInterface> {
		const newReinforcement = await this.reinforcementModel.create({
			...reinforcement,
			schedule: schedule._id,
		});
		return newReinforcement;
	}

	async delete(id: string): Promise<{ id: string }> {
		const schedule = await this.scheduleModel.findById(id);
		if (!schedule) {
			throw new NotFoundException('סידור לא נמצא');
		}
		await schedule.remove();
		return { id: schedule._id.toString() };
	}
}
