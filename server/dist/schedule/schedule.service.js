"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScheduleService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const functions_1 = require("../functions/functions");
let ScheduleService = class ScheduleService {
    constructor(scheduleModel, structureModel) {
        this.scheduleModel = scheduleModel;
        this.structureModel = structureModel;
        this.sortStructures = (a, b) => {
            const first = a.shift;
            const second = b.shift;
            if (first.shift > second.shift) {
                return 1;
            }
            else if (first.shift < second.shift) {
                return -1;
            }
            else {
                if (first.index > second.index) {
                    return 1;
                }
                else if (first.index < second.index) {
                    return -1;
                }
                else {
                    return 0;
                }
            }
        };
        this.arrayDuplicates = (arr) => {
            return arr.filter((item, index) => arr.indexOf(item) != index);
        };
        this.toShiftNamesArray = (shifts, day) => {
            let names = [];
            for (let i = 0; i < shifts.length; i++) {
                names.push(...shifts[i].days[day].split('\n').filter(x => x.length > 0));
            }
            return names;
        };
    }
    async populateSchedule(schedule) {
        let schedule_temp = Object.assign({}, schedule["_doc"]);
        let weeks_tmp = [];
        for (let i = 0; i < schedule.weeks.length; i++) {
            let week_tmp = [];
            for (let j = 0; j < schedule.weeks[i].length; j++) {
                let structureModel = await this.structureModel.findById(schedule.weeks[i][j].shift);
                if (structureModel) {
                    week_tmp.push({ shift: structureModel, days: schedule.weeks[i][j].days });
                }
            }
            week_tmp.sort(this.sortStructures);
            weeks_tmp.push(week_tmp);
        }
        schedule_temp.weeks = weeks_tmp;
        return schedule_temp;
    }
    async getViewSchedule(query) {
        if (!query.page || query.page <= 0) {
            query.page = 0;
        }
        else {
            query.page -= 1;
        }
        let all_schedules = await this.scheduleModel.find().sort({ date: -1 });
        if (all_schedules.length === 0) {
            throw new common_1.NotFoundException('No schedules found');
        }
        let index = 0;
        if (!all_schedules[index].publish) {
            index = 1;
            if (all_schedules.length === 1) {
                throw new common_1.ConflictException('No Published schedule found');
            }
        }
        let pages = all_schedules.length - index;
        let schedule_found = (await this.scheduleModel.find().sort({ date: -1 }).skip(query.page + index).limit(1))[0];
        if (!schedule_found) {
            throw new common_1.NotFoundException('No Schedules found');
        }
        let days = this.calculateDays(schedule_found);
        let schedule = await this.populateSchedule(schedule_found);
        return { schedule: Object.assign(Object.assign({}, schedule), { days }), pages };
    }
    async getAll(query) {
        if (!query.page || query.page <= 0) {
            query.page = 0;
        }
        else {
            query.page -= 1;
        }
        let scheduleCount = await this.scheduleModel.find().count();
        const pages = scheduleCount > 0 ? Math.ceil(scheduleCount / 5) : 1;
        let schedules = await this.scheduleModel.find().sort({ date: -1 }).skip(query.page * 5).limit(5).select('-weeks');
        return { schedules, pages };
    }
    async getLast() {
        let schedules = await this.scheduleModel.find().sort({ date: -1 }).select('-weeks');
        if (schedules.length === 0) {
            throw new common_1.ConflictException('No schedules found');
        }
        let days = this.calculateDays(schedules[0]);
        return Object.assign(Object.assign({}, schedules[0]["_doc"]), { days });
    }
    async getLastData() {
        let schedules = await this.scheduleModel.find().sort({ date: -1 });
        if (schedules.length === 0) {
            throw new common_1.ConflictException('No schedules found');
        }
        let index = 0;
        if (!schedules[index].publish) {
            index = 1;
            if (schedules.length === 1) {
                throw new common_1.ConflictException('No Published schedule found');
            }
        }
        let days = this.calculateDays(schedules[index]);
        let schedule = await this.populateSchedule(schedules[index]);
        return Object.assign(Object.assign({}, schedule), { days });
    }
    calculateDays(schedule) {
        let days_tmp = [];
        let firstDate = new Date(schedule.date);
        for (let j = 0; j < schedule.num_weeks; j++) {
            days_tmp[j] = [];
            for (let i = j * 7; i < (j + 1) * 7; i++) {
                days_tmp[j].push((0, functions_1.addDays)(firstDate, i));
            }
        }
        return days_tmp;
    }
    compareTwoArrays(arr1, arr2) {
        let names = [];
        for (let i = 0; i < arr1.length; i++) {
            if (!arr2.every((x) => x !== arr1[i])) {
                names.push(arr1[i]);
            }
        }
        return names;
    }
    async scheduleValid(weeks) {
        let notifications = new Set();
        for (let i = 0; i < weeks.length; i++) {
            let morningShifts = weeks[i].filter(shift => shift.shift.shift === 0);
            let noonShifts = weeks[i].filter(shift => shift.shift.shift === 1);
            let nightShifts = weeks[i].filter(shift => shift.shift.shift === 2);
            for (let j = 0; j < 7; j++) {
                let morningNames = this.toShiftNamesArray(morningShifts, j);
                let noonNames = this.toShiftNamesArray(noonShifts, j);
                let nightNames = this.toShiftNamesArray(nightShifts, j);
                let duplicates = this.arrayDuplicates(morningNames);
                for (let k = 0; k < duplicates.length; k++) {
                    notifications.add(`ביום ${j + 1} בשבוע ה-${i + 1} ${duplicates[k]} באותה משמרת בוקר כמה פעמים`);
                }
                duplicates = this.arrayDuplicates(noonNames);
                for (let k = 0; k < duplicates.length; k++) {
                    notifications.add(`ביום ${j + 1} בשבוע ה-${i + 1} ${duplicates[k]} באותה משמרת צהריים כמה פעמים`);
                }
                duplicates = this.arrayDuplicates(nightNames);
                for (let k = 0; k < duplicates.length; k++) {
                    notifications.add(`ביום ${j + 1} בשבוע ה-${i + 1} ${duplicates[k]} באותה משמרת לילה כמה פעמים`);
                }
                duplicates = this.compareTwoArrays(morningNames, noonNames);
                for (let k = 0; k < duplicates.length; k++) {
                    notifications.add(`ביום ${j + 1} בשבוע ה-${i + 1} ${duplicates[k]} במשמרת בוקר ואז צהריים`);
                }
                duplicates = this.compareTwoArrays(noonNames, nightNames);
                for (let k = 0; k < duplicates.length; k++) {
                    notifications.add(`ביום ${j + 1} בשבוע ה-${i + 1} ${duplicates[k]} במשמרת צהריים ואז לילה`);
                }
                if (j !== 6) {
                    morningNames = this.toShiftNamesArray(morningShifts, j + 1);
                    duplicates = this.compareTwoArrays(nightNames, morningNames);
                    for (let k = 0; k < duplicates.length; k++) {
                        notifications.add(`ביום ${j + 1} בשבוע ה-${i + 1} ${duplicates[k]} במשמרת לילה ואז בוקר`);
                    }
                }
                else {
                    if (i !== weeks.length - 1) {
                        morningShifts = weeks[i + 1].filter(shift => shift.shift.shift === 0);
                        morningNames = this.toShiftNamesArray(morningShifts, 0);
                        duplicates = this.compareTwoArrays(nightNames, morningNames);
                        for (let k = 0; k < duplicates.length; k++) {
                            notifications.add(`ביום ${j + 1} בשבוע ה-${i + 1} ${duplicates[k]} במשמרת לילה ואז בוקר`);
                        }
                    }
                }
            }
        }
        return [...notifications];
    }
    async getSchedule(id) {
        let schedule = await this.scheduleModel.findById(id);
        if (!schedule) {
            throw new common_1.NotFoundException('Schedule not found');
        }
        schedule = await this.populateSchedule(schedule);
        let days = this.calculateDays(schedule);
        return Object.assign(Object.assign({}, schedule), { days });
    }
    async create(schedule) {
        const rows = await this.structureModel.find().sort({ shift: 1, index: 1 });
        let weeks = [];
        for (let i = 0; i < schedule.num_weeks; i++) {
            weeks[i] = [];
            for (let j = 0; j < rows.length; j++) {
                weeks[i].push({ shift: rows[j]._id.toString(), days: ['', '', '', '', '', '', ''] });
            }
        }
        return await this.scheduleModel.create(Object.assign(Object.assign({}, schedule), { weeks }));
    }
    async update(schedule) {
        let scheduleFound = await this.scheduleModel.findById(schedule._id);
        if (!scheduleFound) {
            throw new common_1.NotFoundException('Schedule not found');
        }
        let newSchedule = await this.scheduleModel.findByIdAndUpdate(schedule._id, schedule, { new: true });
        newSchedule = await this.populateSchedule(newSchedule);
        let days = this.calculateDays(newSchedule);
        return Object.assign(Object.assign({}, newSchedule), { days });
    }
    async delete(id) {
        const schedule = await this.scheduleModel.findById(id);
        if (!schedule) {
            throw new common_1.NotFoundException('Schedule not found');
        }
        await schedule.remove();
        return { id: schedule._id.toString() };
    }
};
ScheduleService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)('Schedule')),
    __param(1, (0, mongoose_1.InjectModel)('Structure')),
    __metadata("design:paramtypes", [mongoose_2.Model, mongoose_2.Model])
], ScheduleService);
exports.ScheduleService = ScheduleService;
//# sourceMappingURL=schedule.service.js.map