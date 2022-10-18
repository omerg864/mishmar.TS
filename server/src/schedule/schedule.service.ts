import { ConflictException, Injectable, NotFoundException, Query } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Structure } from 'src/structure/structure.model';
import { Schedule } from './schedule.model';
import { Document } from 'mongoose';
import { findIndex } from 'rxjs';
import { addDays } from 'src/functions/functions';

export type Shift = { shift: string|Structure, days: string[]}

@Injectable()
export class ScheduleService {

    constructor(@InjectModel('Schedule') private readonly scheduleModel: Model<Schedule>, @InjectModel('Structure') private readonly structureModel: Model<Structure>) {}


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
            } else {
                return 0;
            }
        }
    }


    async populateSchedule(schedule: Schedule): Promise<Schedule> {
        let schedule_temp: Schedule = {...schedule["_doc"]}
        let weeks_tmp: Shift[][] = [];
        for( let i = 0; i < schedule.weeks.length; i++ ) {
            let week_tmp: Shift[] = [];
            for( let j = 0; j < schedule.weeks[i].length; j++ ) {
                let structureModel = await this.structureModel.findById( schedule.weeks[i][j].shift );
                if (structureModel) {
                    week_tmp.push({ shift: structureModel, days: schedule.weeks[i][j].days});
                }
            }
            week_tmp.sort(this.sortStructures);
            weeks_tmp.push(week_tmp);
        }
        schedule_temp.weeks = weeks_tmp;
        return schedule_temp;
    }

    async getViewSchedule(query: {page?: number}): Promise<{schedule: Schedule, pages: number}> {
        if (!query.page || query.page <= 0) {
            query.page = 0;
        } else {
            query.page -= 1;
        }
        let all_schedules =  await this.scheduleModel.find().sort( { date: -1})
        if (all_schedules.length === 0) {
            throw new NotFoundException('No schedules found')
        }
        let index = 0;
        if (!all_schedules[index].publish) {
            index = 1
            if (all_schedules.length === 1) {
                throw new ConflictException('No Published schedule found')
            }
        }
        let pages = all_schedules.length - index;
        let schedule_found =  (await this.scheduleModel.find().sort( { date: -1}).skip(query.page + index).limit(1))[0]
        if (!schedule_found) {
            throw new NotFoundException('No Schedules found');
        }
        let days: Date[][] = this.calculateDays(schedule_found);
        let schedule = await this.populateSchedule(schedule_found);
        return {schedule: {...schedule, days}, pages};
    }


    async getAll(query: {page?: number}): Promise<{schedules: Schedule[], pages: number}> {
        if (!query.page || query.page <= 0) {
            query.page = 0;
        } else {
            query.page -= 1;
        }
        let scheduleCount =  await this.scheduleModel.find().count();
        const pages = scheduleCount > 0 ? Math.ceil(scheduleCount / 5) : 1;
        let schedules =  await this.scheduleModel.find().sort( { date: -1}).skip(query.page * 5).limit(5).select('-weeks');
        return {schedules, pages};
    }

    async getLast() : Promise<Schedule> {
        let schedules = await this.scheduleModel.find().sort({ date: -1}).select('-weeks');
        if (schedules.length === 0) {
            throw new ConflictException('No schedules found')
        }
        let days: Date[][] = this.calculateDays(schedules[0]);
        return { ...schedules[0]["_doc"], days}
    }

    async getLastData() : Promise<Schedule> {
        let schedules = await this.scheduleModel.find().sort({ date: -1});
        if (schedules.length === 0) {
            throw new ConflictException('No schedules found')
        }
        let index = 0;
        if (!schedules[index].publish) {
            index = 1
            if (schedules.length === 1) {
                throw new ConflictException('No Published schedule found')
            }
        }
        let days: Date[][] = this.calculateDays(schedules[index]);
        let schedule = await this.populateSchedule(schedules[index]);
        return { ...schedule, days}
    }

    calculateDays(schedule: Schedule): Date[][] {
        let days_tmp: Date[][] = [];
        let firstDate =  new Date(schedule.date);
        for(let j = 0; j < schedule.num_weeks; j++) {
            days_tmp[j] = [];
            for (let i = j * 7; i < (j + 1) * 7 ; i++) {
                days_tmp[j].push(addDays(firstDate, i));
            }
        }
        return days_tmp;
    }

    arrayDuplicates = (arr: string[]): string[] => {
        return arr.filter((item, index) => arr.indexOf(item) != index)
    }

    toShiftNamesArray = (shifts: Shift[], day: number): string[] => {
        let names: string[] = []
        for (let i = 0; i < shifts.length; i++) {
            names.push(...shifts[i].days[day].split('\n').filter(x => x.length > 0));
        }
        return names;
    }

    compareTwoArrays(arr1: string[], arr2: string[]) {
        let names: string[] = []
        for (let i = 0; i < arr1.length; i++) {
            if (!arr2.every((x: string) => x !== arr1[i])) {
                names.push(arr1[i]);
            }
        }
        return names;
    }

    async scheduleValid(weeks: Shift[][]): Promise<string[]> {
        let notifications: Set<string> = new Set();
        for(let i = 0; i < weeks.length; i++) {
            // i - week number
            let morningShifts = weeks[i].filter(shift => (shift.shift as Structure).shift === 0);
            let noonShifts = weeks[i].filter(shift => (shift.shift as Structure).shift === 1);
            let nightShifts = weeks[i].filter(shift => (shift.shift as Structure).shift === 2);
            for (let j = 0; j < 7; j++) {
                // j - day number
                let morningNames = this.toShiftNamesArray(morningShifts, j);
                let noonNames = this.toShiftNamesArray(noonShifts, j);
                let nightNames = this.toShiftNamesArray(nightShifts, j);
                let duplicates = this.arrayDuplicates(morningNames)
                for (let k = 0; k < duplicates.length; k++) {
                    // k - duplicate name index
                    notifications.add(`ביום ${j + 1} בשבוע ה-${i + 1} ${duplicates[k]} באותה משמרת בוקר כמה פעמים`);
                }
                duplicates = this.arrayDuplicates(noonNames)
                for (let k = 0; k < duplicates.length; k++) {
                    // k - duplicate name index
                    notifications.add(`ביום ${j + 1} בשבוע ה-${i + 1} ${duplicates[k]} באותה משמרת צהריים כמה פעמים`);
                }
                duplicates = this.arrayDuplicates(nightNames)
                for (let k = 0; k < duplicates.length; k++) {
                    // k - duplicate name index
                    notifications.add(`ביום ${j + 1} בשבוע ה-${i + 1} ${duplicates[k]} באותה משמרת לילה כמה פעמים`);
                }
                duplicates = this.compareTwoArrays(morningNames, noonNames);
                for (let k = 0; k < duplicates.length; k++) {
                    // k - duplicate name index
                    notifications.add(`ביום ${j + 1} בשבוע ה-${i + 1} ${duplicates[k]} במשמרת בוקר ואז צהריים`);
                }
                duplicates = this.compareTwoArrays(noonNames, nightNames);
                for (let k = 0; k < duplicates.length; k++) {
                    // k - duplicate name index
                    notifications.add(`ביום ${j + 1} בשבוע ה-${i + 1} ${duplicates[k]} במשמרת צהריים ואז לילה`);
                }
                if ( j !== 6) {
                    morningNames = this.toShiftNamesArray(morningShifts, j + 1);
                    duplicates = this.compareTwoArrays(nightNames, morningNames);
                    for (let k = 0; k < duplicates.length; k++) {
                        // k - duplicate name index
                        notifications.add(`ביום ${j + 1} בשבוע ה-${i + 1} ${duplicates[k]} במשמרת לילה ואז בוקר`);
                    }
                } else {
                    if (i !== weeks.length - 1) {
                        morningShifts = weeks[i + 1].filter(shift => (shift.shift as Structure).shift === 0);
                        morningNames = this.toShiftNamesArray(morningShifts, 0);
                        duplicates = this.compareTwoArrays(nightNames, morningNames);
                        for (let k = 0; k < duplicates.length; k++) {
                            // k - duplicate name index
                            notifications.add(`ביום ${j + 1} בשבוע ה-${i + 1} ${duplicates[k]} במשמרת לילה ואז בוקר`);
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
            throw new NotFoundException('Schedule not found');
        }
        schedule = await this.populateSchedule(schedule);
        let days: Date[][] = this.calculateDays(schedule);
        return {...schedule, days };
    }

    async create(schedule: Schedule): Promise<Schedule> {
        const rows = await this.structureModel.find().sort({ shift: 1, index: 1});
        let weeks: Shift[][] = [];
        for (let i = 0; i < schedule.num_weeks; i++) {
            weeks[i] = []
            for (let j = 0; j < rows.length; j++) {
                weeks[i].push({shift: rows[j]._id.toString(), days: ['', '', '', '', '', '', '']});
            }
        }
        return await this.scheduleModel.create({...schedule, weeks});
    }

    async update(schedule: Schedule): Promise<Schedule> {
        let scheduleFound = await this.scheduleModel.findById(schedule._id);
        if (!scheduleFound) {
            throw new NotFoundException('Schedule not found');
        }
        let newSchedule: Schedule = await this.scheduleModel.findByIdAndUpdate(schedule._id, schedule, {new: true});
        newSchedule = await this.populateSchedule(newSchedule);
        let days: Date[][] = this.calculateDays(newSchedule);
        return {...newSchedule, days};
        
    }

    async delete(id: string): Promise<{id: string}> {
        const schedule = await this.scheduleModel.findById(id);
        if (!schedule) {
            throw new NotFoundException('Schedule not found');
        }
        await schedule.remove();
        return {id: schedule._id.toString()};
    }
}
