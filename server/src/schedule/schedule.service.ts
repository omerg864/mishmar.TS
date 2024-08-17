/* eslint-disable prefer-const */
import {
	ConflictException,
	Injectable,
	NotFoundException,
	Query,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Structure } from '../structure/structure.model';
import { Schedule } from './schedule.model';
import { addDays, getRandomIndex, numberToDay } from '../functions/functions';
import * as XLSX from 'xlsx';
import * as excel from 'excel4node';
import * as fs from 'fs';
import { User } from '../user/user.model';
import { Settings } from '../settings/settings.model';
import { Logger } from '@nestjs/common';

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
		@InjectModel('Settings') private readonly settingsModel: Model<Settings>
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
		let cache: {[id: string] : Structure| null } = { omer: null };
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
					cache[schedule.weeks[i][j].shift.toString()] = structureModel;
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

	async getViewSchedule(query: {
		page?: number;
	}): Promise<{ schedule: Schedule; pages: number }> {
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
		let days: Date[][] = this.calculateDays(schedule_found);
		let schedule = await this.populateSchedule(schedule_found);
		return { schedule: { ...schedule, days }, pages };
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
		console.log(
			'🚀 ~ file: schedule.service.ts ~ line 261 ~ ScheduleService ~ excelToSchedule ~ extractedData',
			extractedData[0][0]
		);
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
		console.log(extractedData[0]);
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
		schedule = await this.populateSchedule(schedule);
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

	async getSchedule(id: string): Promise<Schedule> {
		let schedule: Schedule = await this.scheduleModel.findById(id);
		if (!schedule) {
			throw new NotFoundException('סידור לא נמצא');
		}
		schedule = await this.populateSchedule(schedule);
		let days: Date[][] = this.calculateDays(schedule);
		return { ...schedule, days };
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

	async update(schedule: Schedule): Promise<{ success: boolean}> {
		let scheduleFound = await this.scheduleModel.findById(schedule._id);
		if (!scheduleFound) {
			throw new NotFoundException('סידור לא נמצא');
		}
		let newSchedule: Schedule = await this.scheduleModel.findByIdAndUpdate(
			schedule._id,
			schedule
		);
		return { success: true };
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
