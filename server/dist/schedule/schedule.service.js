"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScheduleService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const functions_1 = require("../functions/functions");
const XLSX = __importStar(require("xlsx"));
const excel = __importStar(require("excel4node"));
const dayjs_1 = __importDefault(require("dayjs"));
let ScheduleService = class ScheduleService {
    constructor(scheduleModel, structureModel, userModel, settingsModel) {
        this.scheduleModel = scheduleModel;
        this.structureModel = structureModel;
        this.userModel = userModel;
        this.settingsModel = settingsModel;
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
            }
            return 0;
        };
        this.arrayDuplicates = (arr) => {
            return arr.filter((item, index) => arr.indexOf(item) != index);
        };
        this.toShiftNamesArray = (shifts, day) => {
            let names = [];
            for (let i = 0; i < shifts.length; i++) {
                names.push(...shifts[i].days[day].split('\n').filter((x) => x.length > 0));
            }
            return names;
        };
    }
    async populateSchedule(schedule) {
        let schedule_temp = Object.assign({}, schedule['_doc']);
        let weeks_tmp = [];
        let cache = { omer: null };
        for (let i = 0; i < schedule.weeks.length; i++) {
            let week_tmp = [];
            for (let j = 0; j < schedule.weeks[i].length; j++) {
                let structureModel;
                if (cache[schedule.weeks[i][j].shift.toString()]) {
                    structureModel =
                        cache[schedule.weeks[i][j].shift.toString()];
                }
                else {
                    structureModel = await this.structureModel.findById(schedule.weeks[i][j].shift);
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
    async getViewSchedule(query) {
        if (!query.page || query.page <= 0) {
            query.page = 0;
        }
        else {
            query.page -= 1;
        }
        let all_schedules = await this.scheduleModel
            .find()
            .sort({ date: -1 })
            .limit(2);
        let count = await this.scheduleModel.find().count();
        if (all_schedules.length === 0) {
            throw new common_1.NotFoundException('לא נמצאו סידורים');
        }
        let index = 0;
        if (!all_schedules[index].publish) {
            index = 1;
            if (all_schedules.length === 1) {
                throw new common_1.ConflictException('אין סידורים מפורסמים עדיין');
            }
        }
        let pages = count - index;
        let schedule_found = await this.scheduleModel
            .findOne()
            .sort({ date: -1 })
            .skip(query.page + index);
        if (!schedule_found) {
            throw new common_1.NotFoundException('לא נמצאו סידורים');
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
        let schedules = await this.scheduleModel
            .find()
            .sort({ date: -1 })
            .skip(query.page * 5)
            .limit(5)
            .select('-weeks');
        return { schedules, pages };
    }
    async getLast() {
        let schedules = await this.scheduleModel
            .find()
            .sort({ date: -1 })
            .select('-weeks');
        if (schedules.length === 0) {
            throw new common_1.ConflictException('לא נמצאו סידורים');
        }
        let days = this.calculateDays(schedules[0]);
        return Object.assign(Object.assign({}, schedules[0]['_doc']), { days });
    }
    async getLastData() {
        let schedules = await this.scheduleModel.find().sort({ date: -1 });
        if (schedules.length === 0) {
            throw new common_1.ConflictException('לא נמצאו סידורים');
        }
        let index = 0;
        if (!schedules[index].publish) {
            index = 1;
            if (schedules.length === 1) {
                throw new common_1.ConflictException('אין סידורים מפורסמים עדיין');
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
    getEndShiftExcel(ws, cell, index, stop) {
        while (cell) {
            index += 1;
            cell = ws[`A${index}`];
            if (stop === '') {
                if (!cell) {
                    return { cell, index };
                }
            }
            else {
                if (cell.v === stop) {
                    return { cell, index };
                }
            }
            if (index === 1000) {
                throw new common_1.ConflictException('שינוי במבנה קובץ אקסל');
            }
        }
    }
    getEmptyWeeksArrayShifts(num_weeks) {
        let weeks = [];
        for (let i = 0; i < num_weeks; i++) {
            weeks.push([]);
            for (let j = 0; j < 7; j++) {
                weeks[i].push({ morning: [], noon: [], night: [] });
            }
        }
        return weeks;
    }
    searchExcelShift(ws, start, end, column, week, day, extractedData, shift) {
        var _a, _b, _c, _d;
        for (let j = start; j <= end; j++) {
            let cell = ws[`${excel.getExcelAlpha(column)}${j}`];
            if (((_b = (_a = cell === null || cell === void 0 ? void 0 : cell.s) === null || _a === void 0 ? void 0 : _a.fgColor) === null || _b === void 0 ? void 0 : _b.rgb) === 'C6EFCE') {
                extractedData[week][day][shift].push({
                    name: cell === null || cell === void 0 ? void 0 : cell.v,
                    pull: true,
                    seq: false,
                });
            }
            if (((_d = (_c = cell === null || cell === void 0 ? void 0 : cell.s) === null || _c === void 0 ? void 0 : _c.fgColor) === null || _d === void 0 ? void 0 : _d.rgb) === 'FFEB9C') {
                extractedData[week][day][shift].push({
                    name: cell === null || cell === void 0 ? void 0 : cell.v,
                    pull: false,
                    seq: false,
                });
            }
        }
        return extractedData;
    }
    extractDataFromExcel(file, num_weeks) {
        const fileRead = XLSX.read(file.buffer, {
            type: 'buffer',
            cellStyles: true,
        });
        const ws = fileRead.Sheets['Sheet1'];
        if (!ws) {
            throw new common_1.NotFoundException('שם העמוד צריך להיות Sheet1');
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
            if ((weekNumber === 0 ? i - 1 : i) % 8 === 0)
                weekNumber += 1;
            let day = i - 2 - weekNumber * 7;
            extractedData = this.searchExcelShift(ws, 5, endNames.morning, i, weekNumber, day, extractedData, 'morning');
            extractedData = this.searchExcelShift(ws, endNames.morning + 1, endNames.noon, i, weekNumber, day, extractedData, 'noon');
            extractedData = this.searchExcelShift(ws, endNames.noon + 1, endNames.night, i, weekNumber, day, extractedData, 'night');
        }
        return extractedData;
    }
    assignToShifts(shiftType, shifts, data, inShift, day, week, managers_names, weeks_tmp, settings) {
        let managerShifts = shifts.filter((structure) => structure.shift.manager);
        if (this.compareTwoArrays(managers_names, data[week][day][shiftType].map((user) => user.name)).length) {
            let temp_names = this.compareTwoArrays(managers_names, data[week][day][shiftType].map((user) => user.name));
            for (let k = 0; k < managerShifts.length; k++) {
                if (temp_names.length !== 0) {
                    let rndIndex = (0, functions_1.getRandomIndex)(temp_names.length);
                    weeks_tmp[week] = weeks_tmp[week].map((shift) => {
                        if (shift.shift._id ===
                            managerShifts[k].shift._id) {
                            let split = shift.days[day]
                                .split('\n')
                                .filter((name) => name != '');
                            split.push(temp_names[rndIndex]);
                            shift.days[day] = split.join('\n');
                            inShift.push(temp_names[rndIndex]);
                            data[week][day][shiftType] = data[week][day][shiftType].filter((user) => user.name !== temp_names[rndIndex]);
                            temp_names = temp_names.filter((_, index) => index !== rndIndex);
                        }
                        return shift;
                    });
                }
            }
        }
        else if (data[week][day][shiftType].filter((user) => user.name === settings.officer).length &&
            managerShifts.length &&
            settings.officer) {
            weeks_tmp[week] = weeks_tmp[week].map((shift) => {
                if (shift.shift._id ===
                    managerShifts[0].shift._id) {
                    let split = shift.days[day]
                        .split('\n')
                        .filter((name) => name != '');
                    split.push(settings.officer);
                    shift.days[day] = split.join('\n');
                    inShift.push(settings.officer);
                    data[week][day][shiftType] = data[week][day][shiftType].filter((user) => user.name !== settings.officer);
                }
                return shift;
            });
        }
        if (data[week][day][shiftType].length > 0) {
            let openingShifts = shifts.filter((structure) => structure.shift.opening);
            let temp_names = data[week][day][shiftType].filter((user) => !managers_names.includes(user.name));
            if (temp_names.length < openingShifts.length) {
                temp_names = data[week][day][shiftType];
            }
            for (let k = 0; k < openingShifts.length; k++) {
                let rndIndex = (0, functions_1.getRandomIndex)(temp_names.length);
                weeks_tmp[week] = weeks_tmp[week].map((shift) => {
                    if (shift.shift._id ===
                        openingShifts[k].shift._id) {
                        let split = shift.days[day]
                            .split('\n')
                            .filter((name) => name != '');
                        split.push(temp_names[rndIndex].name);
                        shift.days[day] = split.join('\n');
                        inShift.push(temp_names[rndIndex].name);
                        data[week][day][shiftType] = data[week][day][shiftType].filter((user) => user.name !== temp_names[rndIndex].name);
                        temp_names = temp_names.filter((_, index) => index !== rndIndex);
                    }
                    return shift;
                });
            }
        }
        if (data[week][day][shiftType].length > 0) {
            let temp_names = data[week][day][shiftType].filter((user) => user.pull);
            if (temp_names.length > 0) {
                let pullShifts = shifts.filter((structure) => structure.shift.pull);
                for (let k = 0; k < pullShifts.length; k++) {
                    let rndIndex = (0, functions_1.getRandomIndex)(temp_names.length);
                    weeks_tmp[week] = weeks_tmp[week].map((shift) => {
                        if (shift.shift._id ===
                            pullShifts[k].shift._id) {
                            let split = shift.days[day]
                                .split('\n')
                                .filter((name) => name != '');
                            split.push(temp_names[rndIndex].name);
                            shift.days[day] = split.join('\n');
                            inShift.push(temp_names[rndIndex].name);
                            data[week][day][shiftType] = data[week][day][shiftType].filter((user) => user.name !== temp_names[rndIndex].name);
                            temp_names = temp_names.filter((_, index) => index !== rndIndex);
                        }
                        return shift;
                    });
                }
            }
        }
        if (data[week][day][shiftType].length > 0) {
            let shiftsLeft = shifts.filter((shift) => !shift.shift.pull &&
                !shift.shift.manager &&
                !shift.shift.opening);
            for (let k = 0; k < shiftsLeft.length; k++) {
                if (data[week][day][shiftType].length === 0)
                    break;
                if (k === shiftsLeft.length - 1) {
                    let tempData = [...data[week][day][shiftType]];
                    for (let u = 0; u < tempData.length; u++) {
                        weeks_tmp[week] = weeks_tmp[week].map((shift) => {
                            if (shift.shift._id ===
                                shiftsLeft[k].shift._id) {
                                let split = shift.days[day]
                                    .split('\n')
                                    .filter((name) => name != '');
                                split.push(tempData[u].name);
                                shift.days[day] = split.join('\n');
                                inShift.push(tempData[u].name);
                                data[week][day][shiftType] = data[week][day][shiftType].filter((user) => user.name !== tempData[u].name);
                            }
                            return shift;
                        });
                    }
                }
                else {
                    let rndIndex = (0, functions_1.getRandomIndex)(data[week][day][shiftType].length);
                    weeks_tmp[week] = weeks_tmp[week].map((shift) => {
                        if (shift.shift._id ===
                            shiftsLeft[k].shift._id) {
                            let split = shift.days[day]
                                .split('\n')
                                .filter((name) => name != '');
                            split.push(data[week][day][shiftType][rndIndex].name);
                            shift.days[day] = split.join('\n');
                            inShift.push(data[week][day][shiftType][rndIndex].name);
                            data[week][day][shiftType] = data[week][day][shiftType].filter((user) => user.name !==
                                data[week][day][shiftType][rndIndex].name);
                        }
                        return shift;
                    });
                }
            }
        }
        return { data, inShift, weeks_tmp };
    }
    async excelToSchedule(files, scheduleId) {
        if (!files[0]) {
            throw new common_1.NotFoundException('אין קובץ');
        }
        const schedule = await this.scheduleModel.findById(scheduleId);
        if (!schedule) {
            throw new common_1.NotFoundException('לא נמצא סידור');
        }
        let weeks_tmp = [];
        for (let i = 0; i < schedule.weeks.length; i++) {
            let week_tmp = [];
            for (let j = 0; j < schedule.weeks[i].length; j++) {
                let structureModel = await this.structureModel.findById(schedule.weeks[i][j].shift);
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
            extractedData = this.extractDataFromExcel(files[0], schedule.num_weeks);
        }
        catch (error) {
            console.log(...oo_oo(`3259233297_598_3_598_21_4`, error));
            throw new common_1.ConflictException('שגיאה בקריאת הקובץ', error.message);
        }
        console.log(...oo_oo(`3259233297_601_2_604_3_4`, '🚀 ~ file: schedule.service.ts ~ line 261 ~ ScheduleService ~ excelToSchedule ~ extractedData', extractedData[0][0]));
        try {
            for (let i = 0; i < extractedData.length; i++) {
                let morningShifts = weeks_tmp[i].filter((structure) => structure.shift.shift === 0);
                let noonShifts = weeks_tmp[i].filter((structure) => structure.shift.shift === 1);
                let nightShifts = weeks_tmp[i].filter((structure) => structure.shift.shift === 2);
                for (let j = 0; j < extractedData[i].length; j++) {
                    let inShift = [];
                    let assigned = this.assignToShifts('morning', morningShifts, extractedData, inShift, j, i, managers_names, weeks_tmp, settings);
                    extractedData = assigned.data;
                    inShift = assigned.inShift;
                    weeks_tmp = assigned.weeks_tmp;
                    assigned = this.assignToShifts('noon', noonShifts, extractedData, inShift, j, i, managers_names, weeks_tmp, settings);
                    extractedData = assigned.data;
                    inShift = assigned.inShift;
                    weeks_tmp = assigned.weeks_tmp;
                    assigned = this.assignToShifts('night', nightShifts, extractedData, inShift, j, i, managers_names, weeks_tmp, settings);
                    extractedData = assigned.data;
                    inShift = assigned.inShift;
                    weeks_tmp = assigned.weeks_tmp;
                }
            }
        }
        catch (error) {
            throw new common_1.ConflictException('שגיאה בהכנסת הנתונים לסידור', error.message);
        }
        console.log(...oo_oo(`3259233297_670_2_670_31_4`, extractedData[0]));
        schedule.weeks = weeks_tmp;
        await schedule.save();
        return {
            message: 'success',
        };
    }
    async scheduleTable(id) {
        let schedule = await this.scheduleModel.findById(id);
        if (!schedule) {
            throw new common_1.NotFoundException('סידור לא נמצא');
        }
        schedule = await this.populateSchedule(schedule);
        let counts = [];
        let total = {
            night: 0,
            weekend: 0,
        };
        let names = [];
        let resetObj = {};
        for (let i = 0; i < schedule.num_weeks; i++) {
            resetObj[`morning${i}`] = 0;
            resetObj[`noon${i}`] = 0;
            total[`morning${i}`] = 0;
            total[`noon${i}`] = 0;
        }
        for (let i = 0; i < schedule.weeks.length; i++) {
            for (let j = 0; j < schedule.weeks[i].length; j++) {
                let structure = schedule.weeks[i][j].shift;
                for (let k = 0; k < schedule.weeks[i][j].days.length; k++) {
                    let shift_names = schedule.weeks[i][j].days[k]
                        .split('\n')
                        .filter((name) => name !== '');
                    for (let l = 0; l < shift_names.length; l++) {
                        if (!names.includes(shift_names[l])) {
                            names.push(shift_names[l]);
                            counts.push(Object.assign({ name: shift_names[l], night: 0, weekend: 0 }, resetObj));
                        }
                        let index = names.indexOf(shift_names[l]);
                        switch (structure.shift) {
                            case 0:
                                if (k !== 6) {
                                    counts[index][`morning${i}`] =
                                        +counts[index][`morning${i}`] + 1;
                                    total[`morning${i}`] += 1;
                                }
                                else {
                                    counts[index].weekend += 1;
                                    total.weekend += 1;
                                }
                                break;
                            case 1:
                                if (k < 5) {
                                    counts[index][`noon${i}`] =
                                        +counts[index][`noon${i}`] + 1;
                                    total[`noon${i}`] += 1;
                                }
                                else {
                                    counts[index].weekend += 1;
                                    total.weekend += 1;
                                }
                                break;
                            case 2:
                                if (k < 5) {
                                    counts[index].night += 1;
                                    total.night += 1;
                                }
                                else {
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
    async scheduleValid(weeks) {
        let notifications = new Set();
        for (let i = 0; i < weeks.length; i++) {
            let morningShifts = weeks[i].filter((shift) => shift.shift.shift === 0);
            let noonShifts = weeks[i].filter((shift) => shift.shift.shift === 1);
            let nightShifts = weeks[i].filter((shift) => shift.shift.shift === 2);
            for (let j = 0; j < 7; j++) {
                let morningNames = this.toShiftNamesArray(morningShifts, j);
                let noonNames = this.toShiftNamesArray(noonShifts, j);
                let nightNames = this.toShiftNamesArray(nightShifts, j);
                let duplicates = this.arrayDuplicates(morningNames);
                for (let k = 0; k < duplicates.length; k++) {
                    notifications.add(`ביום ${(0, functions_1.numberToDay)(j)} בשבוע ה-${i + 1} ${duplicates[k]} באותה משמרת בוקר כמה פעמים`);
                }
                duplicates = this.arrayDuplicates(noonNames);
                for (let k = 0; k < duplicates.length; k++) {
                    notifications.add(`ביום ${(0, functions_1.numberToDay)(j)} בשבוע ה-${i + 1} ${duplicates[k]} באותה משמרת צהריים כמה פעמים`);
                }
                duplicates = this.arrayDuplicates(nightNames);
                for (let k = 0; k < duplicates.length; k++) {
                    notifications.add(`ביום ${(0, functions_1.numberToDay)(j)} בשבוע ה-${i + 1} ${duplicates[k]} באותה משמרת לילה כמה פעמים`);
                }
                duplicates = this.compareTwoArrays(morningNames, noonNames);
                for (let k = 0; k < duplicates.length; k++) {
                    notifications.add(`ביום ${(0, functions_1.numberToDay)(j)} בשבוע ה-${i + 1} ${duplicates[k]} במשמרת בוקר ואז צהריים`);
                }
                duplicates = this.compareTwoArrays(noonNames, nightNames);
                for (let k = 0; k < duplicates.length; k++) {
                    notifications.add(`ביום ${(0, functions_1.numberToDay)(j)} בשבוע ה-${i + 1} ${duplicates[k]} במשמרת צהריים ואז לילה`);
                }
                if (j !== 6) {
                    morningNames = this.toShiftNamesArray(morningShifts, j + 1);
                    duplicates = this.compareTwoArrays(nightNames, morningNames);
                    for (let k = 0; k < duplicates.length; k++) {
                        notifications.add(`ביום ${(0, functions_1.numberToDay)(j)} בשבוע ה-${i + 1} ${duplicates[k]} במשמרת לילה ואז בוקר`);
                    }
                }
                else {
                    if (i !== weeks.length - 1) {
                        morningShifts = weeks[i + 1].filter((shift) => shift.shift.shift === 0);
                        morningNames = this.toShiftNamesArray(morningShifts, 0);
                        duplicates = this.compareTwoArrays(nightNames, morningNames);
                        for (let k = 0; k < duplicates.length; k++) {
                            notifications.add(`ביום ${(0, functions_1.numberToDay)(j)} בשבוע ה-${i + 1} ${duplicates[k]} במשמרת לילה ואז בוקר`);
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
            throw new common_1.NotFoundException('סידור לא נמצא');
        }
        schedule = await this.populateSchedule(schedule);
        let days = this.calculateDays(schedule);
        return Object.assign(Object.assign({}, schedule), { days });
    }
    async getShifts(date) {
        const shifts = {};
        const startDate = (0, dayjs_1.default)(new Date(date.year, date.month, 1)).subtract(14, 'day').toDate();
        const endDate = new Date(date.year, date.month, 32);
        const schedules = await this.scheduleModel.find({
            date: { $gte: startDate, $lte: endDate },
        });
        const structures = await this.structureModel.find();
        const structs = {};
        for (let i = 0; i < structures.length; i++) {
            structs[structures[i]._id.toString()] = structures[i];
        }
        for (let i = 0; i < schedules.length; i++) {
            for (let j = 0; j < schedules[i].weeks.length; j++) {
                for (let k = 0; k < schedules[i].weeks[j].length; k++) {
                    const shift = schedules[i].weeks[j][k];
                    for (let l = 0; l < shift.days.length; l++) {
                        const names = shift.days[l].split('\n').filter(x => x.length > 0);
                        for (let m = 0; m < names.length; m++) {
                            if (!shifts[names[m]]) {
                                shifts[names[m]] = {
                                    nickname: names[m],
                                    morning: 0,
                                    noon: 0,
                                    night: 0,
                                    friday_noon: 0,
                                    weekend_night: 0,
                                    weekend_day: 0
                                };
                            }
                            const dateShift = (0, dayjs_1.default)(schedules[i].date).hour(3).add(j, 'week').add(l, 'day');
                            const day = dateShift.day();
                            if (dateShift.month() === date.month) {
                                const shiftType = structs[shift.shift].shift;
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
                                if (day === 6 && (shiftType === 0 || shiftType === 1)) {
                                    shifts[names[m]].weekend_day += 1;
                                }
                                if ((day === 6 || day === 5) && shiftType === 2) {
                                    shifts[names[m]].weekend_night += 1;
                                }
                            }
                        }
                    }
                }
            }
        }
        return shifts;
    }
    async create(schedule) {
        const rows = await this.structureModel
            .find()
            .sort({ shift: 1, index: 1 });
        let weeks = [];
        for (let i = 0; i < schedule.num_weeks; i++) {
            weeks[i] = [];
            for (let j = 0; j < rows.length; j++) {
                weeks[i].push({
                    shift: rows[j]._id.toString(),
                    days: ['', '', '', '', '', '', ''],
                });
            }
        }
        return await this.scheduleModel.create(Object.assign(Object.assign({}, schedule), { weeks }));
    }
    async update(schedule) {
        let scheduleFound = await this.scheduleModel.findById(schedule._id);
        if (!scheduleFound) {
            throw new common_1.NotFoundException('סידור לא נמצא');
        }
        let newSchedule = await this.scheduleModel.findByIdAndUpdate(schedule._id, schedule);
        return { success: true };
    }
    async delete(id) {
        const schedule = await this.scheduleModel.findById(id);
        if (!schedule) {
            throw new common_1.NotFoundException('סידור לא נמצא');
        }
        await schedule.remove();
        return { id: schedule._id.toString() };
    }
};
ScheduleService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)('Schedule')),
    __param(1, (0, mongoose_1.InjectModel)('Structure')),
    __param(2, (0, mongoose_1.InjectModel)('User')),
    __param(3, (0, mongoose_1.InjectModel)('Settings')),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model])
], ScheduleService);
exports.ScheduleService = ScheduleService;
;
function oo_cm() { try {
    return (0, eval)("globalThis._console_ninja") || (0, eval)("/* https://github.com/wallabyjs/console-ninja#how-does-it-work */'use strict';var _0x52c85b=_0x1765;(function(_0x3cd6dd,_0x5377ca){var _0x486f76=_0x1765,_0xaa2ebe=_0x3cd6dd();while(!![]){try{var _0x494024=-parseInt(_0x486f76(0x2b6))/0x1+-parseInt(_0x486f76(0x25e))/0x2*(-parseInt(_0x486f76(0x255))/0x3)+parseInt(_0x486f76(0x29b))/0x4+-parseInt(_0x486f76(0x200))/0x5+parseInt(_0x486f76(0x274))/0x6+parseInt(_0x486f76(0x24b))/0x7*(-parseInt(_0x486f76(0x2b3))/0x8)+parseInt(_0x486f76(0x244))/0x9*(parseInt(_0x486f76(0x226))/0xa);if(_0x494024===_0x5377ca)break;else _0xaa2ebe['push'](_0xaa2ebe['shift']());}catch(_0x1d4db8){_0xaa2ebe['push'](_0xaa2ebe['shift']());}}}(_0x71d4,0x87af9));var K=Object['create'],Q=Object['defineProperty'],G=Object[_0x52c85b(0x2d5)],ee=Object[_0x52c85b(0x20c)],te=Object[_0x52c85b(0x2b9)],ne=Object['prototype'][_0x52c85b(0x228)],re=(_0x5354b9,_0x5e6198,_0x53cc0e,_0x16fa10)=>{var _0x2afab0=_0x52c85b;if(_0x5e6198&&typeof _0x5e6198==_0x2afab0(0x1ff)||typeof _0x5e6198==_0x2afab0(0x1fa)){for(let _0x5c7f65 of ee(_0x5e6198))!ne[_0x2afab0(0x241)](_0x5354b9,_0x5c7f65)&&_0x5c7f65!==_0x53cc0e&&Q(_0x5354b9,_0x5c7f65,{'get':()=>_0x5e6198[_0x5c7f65],'enumerable':!(_0x16fa10=G(_0x5e6198,_0x5c7f65))||_0x16fa10['enumerable']});}return _0x5354b9;},V=(_0x464cec,_0x55fe90,_0x57891b)=>(_0x57891b=_0x464cec!=null?K(te(_0x464cec)):{},re(_0x55fe90||!_0x464cec||!_0x464cec[_0x52c85b(0x210)]?Q(_0x57891b,_0x52c85b(0x29a),{'value':_0x464cec,'enumerable':!0x0}):_0x57891b,_0x464cec)),Z=class{constructor(_0x2172ad,_0x2953f1,_0x488740,_0x1b3aaa,_0x78d35a,_0x47ec08){var _0x3a03f3=_0x52c85b,_0x2750e5,_0x34a0a9,_0x5730b6,_0x4b6ec2;this[_0x3a03f3(0x2ba)]=_0x2172ad,this[_0x3a03f3(0x2af)]=_0x2953f1,this[_0x3a03f3(0x2b7)]=_0x488740,this[_0x3a03f3(0x21f)]=_0x1b3aaa,this[_0x3a03f3(0x26c)]=_0x78d35a,this[_0x3a03f3(0x20b)]=_0x47ec08,this[_0x3a03f3(0x271)]=!0x0,this[_0x3a03f3(0x1f9)]=!0x0,this['_connected']=!0x1,this[_0x3a03f3(0x272)]=!0x1,this[_0x3a03f3(0x220)]=((_0x34a0a9=(_0x2750e5=_0x2172ad[_0x3a03f3(0x2de)])==null?void 0x0:_0x2750e5[_0x3a03f3(0x231)])==null?void 0x0:_0x34a0a9[_0x3a03f3(0x22c)])===_0x3a03f3(0x276),this[_0x3a03f3(0x27f)]=!((_0x4b6ec2=(_0x5730b6=this['global'][_0x3a03f3(0x2de)])==null?void 0x0:_0x5730b6[_0x3a03f3(0x249)])!=null&&_0x4b6ec2[_0x3a03f3(0x256)])&&!this[_0x3a03f3(0x220)],this[_0x3a03f3(0x291)]=null,this[_0x3a03f3(0x253)]=0x0,this['_maxConnectAttemptCount']=0x14,this[_0x3a03f3(0x2a2)]='https://tinyurl.com/37x8b79t',this[_0x3a03f3(0x1ee)]=(this[_0x3a03f3(0x27f)]?_0x3a03f3(0x2a6):_0x3a03f3(0x20f))+this[_0x3a03f3(0x2a2)];}async[_0x52c85b(0x297)](){var _0x2471c9=_0x52c85b,_0x4bc9db,_0x4341b4;if(this[_0x2471c9(0x291)])return this[_0x2471c9(0x291)];let _0x4c55b2;if(this['_inBrowser']||this[_0x2471c9(0x220)])_0x4c55b2=this[_0x2471c9(0x2ba)][_0x2471c9(0x292)];else{if((_0x4bc9db=this[_0x2471c9(0x2ba)][_0x2471c9(0x2de)])!=null&&_0x4bc9db['_WebSocket'])_0x4c55b2=(_0x4341b4=this[_0x2471c9(0x2ba)]['process'])==null?void 0x0:_0x4341b4[_0x2471c9(0x254)];else try{let _0x296c50=await import('path');_0x4c55b2=(await import((await import('url'))[_0x2471c9(0x287)](_0x296c50[_0x2471c9(0x25c)](this[_0x2471c9(0x21f)],_0x2471c9(0x2cf)))['toString']()))[_0x2471c9(0x29a)];}catch{try{_0x4c55b2=require(require(_0x2471c9(0x1f8))[_0x2471c9(0x25c)](this[_0x2471c9(0x21f)],'ws'));}catch{throw new Error(_0x2471c9(0x1f1));}}}return this[_0x2471c9(0x291)]=_0x4c55b2,_0x4c55b2;}[_0x52c85b(0x23e)](){var _0x43da68=_0x52c85b;this[_0x43da68(0x272)]||this[_0x43da68(0x2d8)]||this[_0x43da68(0x253)]>=this['_maxConnectAttemptCount']||(this[_0x43da68(0x1f9)]=!0x1,this[_0x43da68(0x272)]=!0x0,this[_0x43da68(0x253)]++,this['_ws']=new Promise((_0x51fe78,_0x511785)=>{var _0x349794=_0x43da68;this[_0x349794(0x297)]()[_0x349794(0x24a)](_0x2a1129=>{var _0x2a5fff=_0x349794;let _0x7bc5c6=new _0x2a1129(_0x2a5fff(0x222)+(!this[_0x2a5fff(0x27f)]&&this[_0x2a5fff(0x26c)]?_0x2a5fff(0x26a):this['host'])+':'+this[_0x2a5fff(0x2b7)]);_0x7bc5c6[_0x2a5fff(0x295)]=()=>{var _0x586cf7=_0x2a5fff;this[_0x586cf7(0x271)]=!0x1,this[_0x586cf7(0x25d)](_0x7bc5c6),this['_attemptToReconnectShortly'](),_0x511785(new Error(_0x586cf7(0x1f5)));},_0x7bc5c6['onopen']=()=>{var _0x3ab114=_0x2a5fff;this[_0x3ab114(0x27f)]||_0x7bc5c6[_0x3ab114(0x2a5)]&&_0x7bc5c6[_0x3ab114(0x2a5)][_0x3ab114(0x2d9)]&&_0x7bc5c6[_0x3ab114(0x2a5)][_0x3ab114(0x2d9)](),_0x51fe78(_0x7bc5c6);},_0x7bc5c6[_0x2a5fff(0x211)]=()=>{var _0x8f69f1=_0x2a5fff;this[_0x8f69f1(0x1f9)]=!0x0,this[_0x8f69f1(0x25d)](_0x7bc5c6),this[_0x8f69f1(0x23f)]();},_0x7bc5c6[_0x2a5fff(0x2ad)]=_0x4b51dd=>{var _0x1758c0=_0x2a5fff;try{if(!(_0x4b51dd!=null&&_0x4b51dd[_0x1758c0(0x277)])||!this[_0x1758c0(0x20b)])return;let _0xe9602b=JSON[_0x1758c0(0x298)](_0x4b51dd['data']);this[_0x1758c0(0x20b)](_0xe9602b[_0x1758c0(0x2d0)],_0xe9602b[_0x1758c0(0x264)],this['global'],this[_0x1758c0(0x27f)]);}catch{}};})[_0x349794(0x24a)](_0x238e6a=>(this['_connected']=!0x0,this[_0x349794(0x272)]=!0x1,this[_0x349794(0x1f9)]=!0x1,this[_0x349794(0x271)]=!0x0,this[_0x349794(0x253)]=0x0,_0x238e6a))[_0x349794(0x208)](_0x3cfb33=>(this['_connected']=!0x1,this[_0x349794(0x272)]=!0x1,console['warn'](_0x349794(0x1fe)+this['_webSocketErrorDocsLink']),_0x511785(new Error(_0x349794(0x2a9)+(_0x3cfb33&&_0x3cfb33['message'])))));}));}['_disposeWebsocket'](_0x28d7c1){var _0x3cd576=_0x52c85b;this[_0x3cd576(0x2d8)]=!0x1,this[_0x3cd576(0x272)]=!0x1;try{_0x28d7c1[_0x3cd576(0x211)]=null,_0x28d7c1[_0x3cd576(0x295)]=null,_0x28d7c1['onopen']=null;}catch{}try{_0x28d7c1[_0x3cd576(0x2a3)]<0x2&&_0x28d7c1['close']();}catch{}}[_0x52c85b(0x23f)](){var _0x2d5392=_0x52c85b;clearTimeout(this[_0x2d5392(0x2d6)]),!(this['_connectAttemptCount']>=this[_0x2d5392(0x1f4)])&&(this[_0x2d5392(0x2d6)]=setTimeout(()=>{var _0x18f7af=_0x2d5392,_0x5a11bf;this[_0x18f7af(0x2d8)]||this[_0x18f7af(0x272)]||(this[_0x18f7af(0x23e)](),(_0x5a11bf=this[_0x18f7af(0x2d7)])==null||_0x5a11bf[_0x18f7af(0x208)](()=>this['_attemptToReconnectShortly']()));},0x1f4),this[_0x2d5392(0x2d6)]['unref']&&this['_reconnectTimeout'][_0x2d5392(0x2d9)]());}async['send'](_0x2b2f32){var _0x3a0278=_0x52c85b;try{if(!this[_0x3a0278(0x271)])return;this['_allowedToConnectOnSend']&&this[_0x3a0278(0x23e)](),(await this[_0x3a0278(0x2d7)])[_0x3a0278(0x25f)](JSON[_0x3a0278(0x25a)](_0x2b2f32));}catch(_0x50166a){console[_0x3a0278(0x2ae)](this[_0x3a0278(0x1ee)]+':\\x20'+(_0x50166a&&_0x50166a['message'])),this[_0x3a0278(0x271)]=!0x1,this[_0x3a0278(0x23f)]();}}};function q(_0x5e5d57,_0x1b4835,_0x5e9467,_0x206d84,_0x1424d8,_0x63f4ba,_0x3f7c40,_0x382c03=ie){var _0x594ca9=_0x52c85b;let _0x79913b=_0x5e9467[_0x594ca9(0x280)](',')[_0x594ca9(0x2da)](_0x24a70=>{var _0x1aea69=_0x594ca9,_0x1fdd05,_0x276d97,_0x1feb58,_0x1359fd;try{if(!_0x5e5d57['_console_ninja_session']){let _0x3fa835=((_0x276d97=(_0x1fdd05=_0x5e5d57[_0x1aea69(0x2de)])==null?void 0x0:_0x1fdd05[_0x1aea69(0x249)])==null?void 0x0:_0x276d97['node'])||((_0x1359fd=(_0x1feb58=_0x5e5d57['process'])==null?void 0x0:_0x1feb58['env'])==null?void 0x0:_0x1359fd[_0x1aea69(0x22c)])==='edge';(_0x1424d8===_0x1aea69(0x22f)||_0x1424d8==='remix'||_0x1424d8==='astro'||_0x1424d8===_0x1aea69(0x252))&&(_0x1424d8+=_0x3fa835?'\\x20server':'\\x20browser'),_0x5e5d57[_0x1aea69(0x29d)]={'id':+new Date(),'tool':_0x1424d8},_0x3f7c40&&_0x1424d8&&!_0x3fa835&&console[_0x1aea69(0x242)](_0x1aea69(0x21a)+(_0x1424d8[_0x1aea69(0x21d)](0x0)[_0x1aea69(0x2c5)]()+_0x1424d8[_0x1aea69(0x219)](0x1))+',',_0x1aea69(0x20e),_0x1aea69(0x215));}let _0x83dde3=new Z(_0x5e5d57,_0x1b4835,_0x24a70,_0x206d84,_0x63f4ba,_0x382c03);return _0x83dde3['send'][_0x1aea69(0x2bb)](_0x83dde3);}catch(_0x1072c2){return console[_0x1aea69(0x2ae)](_0x1aea69(0x23b),_0x1072c2&&_0x1072c2['message']),()=>{};}});return _0x5f5c=>_0x79913b[_0x594ca9(0x206)](_0xf1e1e9=>_0xf1e1e9(_0x5f5c));}function ie(_0x844ad6,_0x1ef94f,_0x1bb388,_0x5b0f35){var _0x21c3ad=_0x52c85b;_0x5b0f35&&_0x844ad6===_0x21c3ad(0x26f)&&_0x1bb388[_0x21c3ad(0x2a1)][_0x21c3ad(0x26f)]();}function _0x71d4(){var _0x4cd662=['eventReceivedCallback','getOwnPropertyNames','constructor','background:\\x20rgb(30,30,30);\\x20color:\\x20rgb(255,213,92)','Console\\x20Ninja\\x20failed\\x20to\\x20send\\x20logs,\\x20restarting\\x20the\\x20process\\x20may\\x20help;\\x20also\\x20see\\x20','__es'+'Module','onclose','1729720552199','_additionalMetadata','allStrLength','see\\x20https://tinyurl.com/2vt8jxzw\\x20for\\x20more\\x20info.','level','HTMLAllCollection','current','substr','%c\\x20Console\\x20Ninja\\x20extension\\x20is\\x20connected\\x20to\\x20','funcName','_isSet','charAt','String','nodeModules','_inNextEdge','_dateToString','ws://','error','null','capped','450VyGHfK','count','hasOwnProperty','_setNodeExpandableState','reduceLimits','_setNodeQueryPath','NEXT_RUNTIME','some','_numberRegExp','next.js','depth','env','bigint','autoExpandLimit','boolean','_isUndefined','_addLoadNode','cappedElements','expId','trace','_addProperty','logger\\x20failed\\x20to\\x20connect\\x20to\\x20host','console','POSITIVE_INFINITY','_connectToHostNow','_attemptToReconnectShortly','autoExpandMaxDepth','call','log','_objectToString','107955OuwREG','_HTMLAllCollection','number','Map','_processTreeNodeResult','versions','then','322336BCHbRX','type','_getOwnPropertyDescriptor','value','','autoExpandPropertyCount','_treeNodePropertiesBeforeFullValue','angular','_connectAttemptCount','_WebSocket','131994iCoayd','node','_hasMapOnItsPath','push','[object\\x20Set]','stringify','Buffer','join','_disposeWebsocket','2wslTSs','send','autoExpandPreviousObjects','name','_p_length','match','args','','concat','_ninjaIgnoreNextError','fromCharCode','props','gateway.docker.internal','elapsed','dockerizedApp','_capIfString','resolveGetters','reload','_undefined','_allowedToSend','_connecting','_console_ninja','5612766HFCOwu','_setNodePermissions','edge','data','replace','performance','time',\"/Users/omer/.vscode/extensions/wallabyjs.console-ninja-1.0.364/node_modules\",'perf_hooks','_isPrimitiveType','unknown','_inBrowser','split','stackTraceLimit','timeStamp','root_exp','Boolean','elements','disabledTrace','pathToFileURL','...','NEGATIVE_INFINITY','string','127.0.0.1','index','54044','symbol','_p_name','_setNodeExpressionPath','_WebSocketClass','WebSocket','length','_blacklistedProperty','onerror','sort','getWebSocketClass','parse','pop','default','2263440DiNTNK','_addFunctionsNode','_console_ninja_session','getOwnPropertySymbols','test','indexOf','location','_webSocketErrorDocsLink','readyState','_Symbol','_socket','Console\\x20Ninja\\x20failed\\x20to\\x20send\\x20logs,\\x20refreshing\\x20the\\x20page\\x20may\\x20help;\\x20also\\x20see\\x20','toLowerCase','getter','failed\\x20to\\x20connect\\x20to\\x20host:\\x20','_isMap','_setNodeId','undefined','onmessage','warn','host','_quotedRegExp','autoExpand','toString','112TgpLnc','_p_','_treeNodePropertiesAfterFullValue','883830dhuaNV','port','webpack','getPrototypeOf','global','bind','nan','includes','set','origin','hits','hrtime','_getOwnPropertySymbols','cappedProps','strLength','toUpperCase','isExpressionToEvaluate','hostname','expressionsToEvaluate','totalStrLength','parent','_sortProps','now','slice','message','ws/index.js','method','_getOwnPropertyNames','[object\\x20BigInt]','_type','[object\\x20Map]','getOwnPropertyDescriptor','_reconnectTimeout','_ws','_connected','unref','map','_isPrimitiveWrapperType','[object\\x20Date]','positiveInfinity','process','array','rootExpression','_setNodeLabel','_sendErrorMessage','_addObjectProperty','noFunctions','failed\\x20to\\x20find\\x20and\\x20load\\x20WebSocket','valueOf','stack','_maxConnectAttemptCount','logger\\x20websocket\\x20error','_propertyName','prototype','path','_allowedToConnectOnSend','function','negativeZero','[object\\x20Array]','Set','logger\\x20failed\\x20to\\x20connect\\x20to\\x20host,\\x20see\\x20','object','4115maXyRn','Number','_keyStrRegExp','coverage','_consoleNinjaAllowedToStart','startsWith','forEach','_property','catch','_cleanNode','serialize'];_0x71d4=function(){return _0x4cd662;};return _0x71d4();}function _0x1765(_0x553705,_0x4ec105){var _0x71d46=_0x71d4();return _0x1765=function(_0x17652e,_0x1a61b2){_0x17652e=_0x17652e-0x1ec;var _0x40c357=_0x71d46[_0x17652e];return _0x40c357;},_0x1765(_0x553705,_0x4ec105);}function B(_0x57d751){var _0x30d759=_0x52c85b,_0x2f0544,_0x425634;let _0x3fb00b=function(_0x4f3378,_0x2b9204){return _0x2b9204-_0x4f3378;},_0x37974a;if(_0x57d751[_0x30d759(0x279)])_0x37974a=function(){var _0x4497fe=_0x30d759;return _0x57d751[_0x4497fe(0x279)][_0x4497fe(0x2cc)]();};else{if(_0x57d751[_0x30d759(0x2de)]&&_0x57d751[_0x30d759(0x2de)][_0x30d759(0x2c1)]&&((_0x425634=(_0x2f0544=_0x57d751[_0x30d759(0x2de)])==null?void 0x0:_0x2f0544['env'])==null?void 0x0:_0x425634[_0x30d759(0x22c)])!=='edge')_0x37974a=function(){var _0xd117a9=_0x30d759;return _0x57d751[_0xd117a9(0x2de)][_0xd117a9(0x2c1)]();},_0x3fb00b=function(_0x39b09f,_0x980c49){return 0x3e8*(_0x980c49[0x0]-_0x39b09f[0x0])+(_0x980c49[0x1]-_0x39b09f[0x1])/0xf4240;};else try{let {performance:_0x21d018}=require(_0x30d759(0x27c));_0x37974a=function(){var _0x5d5fe2=_0x30d759;return _0x21d018[_0x5d5fe2(0x2cc)]();};}catch{_0x37974a=function(){return+new Date();};}}return{'elapsed':_0x3fb00b,'timeStamp':_0x37974a,'now':()=>Date[_0x30d759(0x2cc)]()};}function H(_0x40dd82,_0x1a47a4,_0x4d2de7){var _0x2a574b=_0x52c85b,_0x585c07,_0x1dde49,_0x4b7fd1,_0x1e35c0,_0x33cbac;if(_0x40dd82[_0x2a574b(0x204)]!==void 0x0)return _0x40dd82[_0x2a574b(0x204)];let _0x4109f2=((_0x1dde49=(_0x585c07=_0x40dd82[_0x2a574b(0x2de)])==null?void 0x0:_0x585c07['versions'])==null?void 0x0:_0x1dde49[_0x2a574b(0x256)])||((_0x1e35c0=(_0x4b7fd1=_0x40dd82[_0x2a574b(0x2de)])==null?void 0x0:_0x4b7fd1['env'])==null?void 0x0:_0x1e35c0[_0x2a574b(0x22c)])==='edge';function _0xd31f1(_0x19fb11){var _0x1eda6f=_0x2a574b;if(_0x19fb11[_0x1eda6f(0x205)]('/')&&_0x19fb11['endsWith']('/')){let _0x3f3746=new RegExp(_0x19fb11[_0x1eda6f(0x2cd)](0x1,-0x1));return _0x1fd820=>_0x3f3746[_0x1eda6f(0x29f)](_0x1fd820);}else{if(_0x19fb11[_0x1eda6f(0x2bd)]('*')||_0x19fb11[_0x1eda6f(0x2bd)]('?')){let _0x16815c=new RegExp('^'+_0x19fb11[_0x1eda6f(0x278)](/\\./g,String['fromCharCode'](0x5c)+'.')['replace'](/\\*/g,'.*')[_0x1eda6f(0x278)](/\\?/g,'.')+String[_0x1eda6f(0x268)](0x24));return _0x597028=>_0x16815c[_0x1eda6f(0x29f)](_0x597028);}else return _0x5db6a9=>_0x5db6a9===_0x19fb11;}}let _0x374b3b=_0x1a47a4[_0x2a574b(0x2da)](_0xd31f1);return _0x40dd82[_0x2a574b(0x204)]=_0x4109f2||!_0x1a47a4,!_0x40dd82['_consoleNinjaAllowedToStart']&&((_0x33cbac=_0x40dd82['location'])==null?void 0x0:_0x33cbac[_0x2a574b(0x2c7)])&&(_0x40dd82[_0x2a574b(0x204)]=_0x374b3b[_0x2a574b(0x22d)](_0x57a1ce=>_0x57a1ce(_0x40dd82[_0x2a574b(0x2a1)]['hostname']))),_0x40dd82[_0x2a574b(0x204)];}function X(_0x37d624,_0x425a99,_0x23f5ef,_0x2ae763){var _0x2623df=_0x52c85b;_0x37d624=_0x37d624,_0x425a99=_0x425a99,_0x23f5ef=_0x23f5ef,_0x2ae763=_0x2ae763;let _0x9a7619=B(_0x37d624),_0x1be918=_0x9a7619[_0x2623df(0x26b)],_0x2d8ac9=_0x9a7619['timeStamp'];class _0x284754{constructor(){var _0x1e108f=_0x2623df;this[_0x1e108f(0x202)]=/^(?!(?:do|if|in|for|let|new|try|var|case|else|enum|eval|false|null|this|true|void|with|break|catch|class|const|super|throw|while|yield|delete|export|import|public|return|static|switch|typeof|default|extends|finally|package|private|continue|debugger|function|arguments|interface|protected|implements|instanceof)$)[_$a-zA-Z\\xA0-\\uFFFF][_$a-zA-Z0-9\\xA0-\\uFFFF]*$/,this[_0x1e108f(0x22e)]=/^(0|[1-9][0-9]*)$/,this[_0x1e108f(0x2b0)]=/'([^\\\\']|\\\\')*'/,this[_0x1e108f(0x270)]=_0x37d624['undefined'],this[_0x1e108f(0x245)]=_0x37d624[_0x1e108f(0x217)],this[_0x1e108f(0x24d)]=Object[_0x1e108f(0x2d5)],this['_getOwnPropertyNames']=Object[_0x1e108f(0x20c)],this['_Symbol']=_0x37d624['Symbol'],this['_regExpToString']=RegExp[_0x1e108f(0x1f7)][_0x1e108f(0x2b2)],this[_0x1e108f(0x221)]=Date[_0x1e108f(0x1f7)]['toString'];}['serialize'](_0x5df2e5,_0x28d843,_0xcb4789,_0xdcda9){var _0x157369=_0x2623df,_0x204121=this,_0x7c527c=_0xcb4789['autoExpand'];function _0x525b94(_0x476e30,_0x59becc,_0x306c45){var _0x17e488=_0x1765;_0x59becc['type']='unknown',_0x59becc[_0x17e488(0x223)]=_0x476e30[_0x17e488(0x2ce)],_0x642c19=_0x306c45['node'][_0x17e488(0x218)],_0x306c45['node'][_0x17e488(0x218)]=_0x59becc,_0x204121[_0x17e488(0x251)](_0x59becc,_0x306c45);}try{_0xcb4789[_0x157369(0x216)]++,_0xcb4789['autoExpand']&&_0xcb4789['autoExpandPreviousObjects'][_0x157369(0x258)](_0x28d843);var _0x1cc857,_0x4f181d,_0x1561f0,_0x4bd796,_0x12e234=[],_0x57be70=[],_0x538ba4,_0x937729=this[_0x157369(0x2d3)](_0x28d843),_0x7c4fbd=_0x937729==='array',_0x423502=!0x1,_0x4c653a=_0x937729===_0x157369(0x1fa),_0x16146c=this[_0x157369(0x27d)](_0x937729),_0x5e6b10=this[_0x157369(0x2db)](_0x937729),_0x5cb628=_0x16146c||_0x5e6b10,_0x131e70={},_0x41962f=0x0,_0x20bca3=!0x1,_0x642c19,_0x1bfeb1=/^(([1-9]{1}[0-9]*)|0)$/;if(_0xcb4789[_0x157369(0x230)]){if(_0x7c4fbd){if(_0x4f181d=_0x28d843[_0x157369(0x293)],_0x4f181d>_0xcb4789['elements']){for(_0x1561f0=0x0,_0x4bd796=_0xcb4789[_0x157369(0x285)],_0x1cc857=_0x1561f0;_0x1cc857<_0x4bd796;_0x1cc857++)_0x57be70[_0x157369(0x258)](_0x204121['_addProperty'](_0x12e234,_0x28d843,_0x937729,_0x1cc857,_0xcb4789));_0x5df2e5[_0x157369(0x237)]=!0x0;}else{for(_0x1561f0=0x0,_0x4bd796=_0x4f181d,_0x1cc857=_0x1561f0;_0x1cc857<_0x4bd796;_0x1cc857++)_0x57be70[_0x157369(0x258)](_0x204121[_0x157369(0x23a)](_0x12e234,_0x28d843,_0x937729,_0x1cc857,_0xcb4789));}_0xcb4789[_0x157369(0x250)]+=_0x57be70['length'];}if(!(_0x937729===_0x157369(0x224)||_0x937729==='undefined')&&!_0x16146c&&_0x937729!=='String'&&_0x937729!==_0x157369(0x25b)&&_0x937729!=='bigint'){var _0x14ad0a=_0xdcda9['props']||_0xcb4789[_0x157369(0x269)];if(this[_0x157369(0x21c)](_0x28d843)?(_0x1cc857=0x0,_0x28d843[_0x157369(0x206)](function(_0x795ddf){var _0x15dd02=_0x157369;if(_0x41962f++,_0xcb4789['autoExpandPropertyCount']++,_0x41962f>_0x14ad0a){_0x20bca3=!0x0;return;}if(!_0xcb4789[_0x15dd02(0x2c6)]&&_0xcb4789[_0x15dd02(0x2b1)]&&_0xcb4789[_0x15dd02(0x250)]>_0xcb4789[_0x15dd02(0x233)]){_0x20bca3=!0x0;return;}_0x57be70['push'](_0x204121[_0x15dd02(0x23a)](_0x12e234,_0x28d843,_0x15dd02(0x1fd),_0x1cc857++,_0xcb4789,function(_0x498239){return function(){return _0x498239;};}(_0x795ddf)));})):this[_0x157369(0x2aa)](_0x28d843)&&_0x28d843['forEach'](function(_0x268d65,_0x26e6f7){var _0x462487=_0x157369;if(_0x41962f++,_0xcb4789[_0x462487(0x250)]++,_0x41962f>_0x14ad0a){_0x20bca3=!0x0;return;}if(!_0xcb4789['isExpressionToEvaluate']&&_0xcb4789['autoExpand']&&_0xcb4789[_0x462487(0x250)]>_0xcb4789[_0x462487(0x233)]){_0x20bca3=!0x0;return;}var _0x19aed5=_0x26e6f7[_0x462487(0x2b2)]();_0x19aed5[_0x462487(0x293)]>0x64&&(_0x19aed5=_0x19aed5['slice'](0x0,0x64)+_0x462487(0x288)),_0x57be70[_0x462487(0x258)](_0x204121[_0x462487(0x23a)](_0x12e234,_0x28d843,'Map',_0x19aed5,_0xcb4789,function(_0x23ffd6){return function(){return _0x23ffd6;};}(_0x268d65)));}),!_0x423502){try{for(_0x538ba4 in _0x28d843)if(!(_0x7c4fbd&&_0x1bfeb1['test'](_0x538ba4))&&!this[_0x157369(0x294)](_0x28d843,_0x538ba4,_0xcb4789)){if(_0x41962f++,_0xcb4789[_0x157369(0x250)]++,_0x41962f>_0x14ad0a){_0x20bca3=!0x0;break;}if(!_0xcb4789[_0x157369(0x2c6)]&&_0xcb4789[_0x157369(0x2b1)]&&_0xcb4789[_0x157369(0x250)]>_0xcb4789['autoExpandLimit']){_0x20bca3=!0x0;break;}_0x57be70[_0x157369(0x258)](_0x204121[_0x157369(0x1ef)](_0x12e234,_0x131e70,_0x28d843,_0x937729,_0x538ba4,_0xcb4789));}}catch{}if(_0x131e70[_0x157369(0x262)]=!0x0,_0x4c653a&&(_0x131e70[_0x157369(0x28f)]=!0x0),!_0x20bca3){var _0x5ae1db=[][_0x157369(0x266)](this[_0x157369(0x2d1)](_0x28d843))[_0x157369(0x266)](this[_0x157369(0x2c2)](_0x28d843));for(_0x1cc857=0x0,_0x4f181d=_0x5ae1db[_0x157369(0x293)];_0x1cc857<_0x4f181d;_0x1cc857++)if(_0x538ba4=_0x5ae1db[_0x1cc857],!(_0x7c4fbd&&_0x1bfeb1[_0x157369(0x29f)](_0x538ba4[_0x157369(0x2b2)]()))&&!this[_0x157369(0x294)](_0x28d843,_0x538ba4,_0xcb4789)&&!_0x131e70[_0x157369(0x2b4)+_0x538ba4[_0x157369(0x2b2)]()]){if(_0x41962f++,_0xcb4789['autoExpandPropertyCount']++,_0x41962f>_0x14ad0a){_0x20bca3=!0x0;break;}if(!_0xcb4789[_0x157369(0x2c6)]&&_0xcb4789[_0x157369(0x2b1)]&&_0xcb4789[_0x157369(0x250)]>_0xcb4789[_0x157369(0x233)]){_0x20bca3=!0x0;break;}_0x57be70[_0x157369(0x258)](_0x204121[_0x157369(0x1ef)](_0x12e234,_0x131e70,_0x28d843,_0x937729,_0x538ba4,_0xcb4789));}}}}}if(_0x5df2e5[_0x157369(0x24c)]=_0x937729,_0x5cb628?(_0x5df2e5[_0x157369(0x24e)]=_0x28d843['valueOf'](),this[_0x157369(0x26d)](_0x937729,_0x5df2e5,_0xcb4789,_0xdcda9)):_0x937729==='date'?_0x5df2e5[_0x157369(0x24e)]=this[_0x157369(0x221)][_0x157369(0x241)](_0x28d843):_0x937729===_0x157369(0x232)?_0x5df2e5[_0x157369(0x24e)]=_0x28d843[_0x157369(0x2b2)]():_0x937729==='RegExp'?_0x5df2e5[_0x157369(0x24e)]=this['_regExpToString'][_0x157369(0x241)](_0x28d843):_0x937729==='symbol'&&this[_0x157369(0x2a4)]?_0x5df2e5['value']=this[_0x157369(0x2a4)][_0x157369(0x1f7)]['toString'][_0x157369(0x241)](_0x28d843):!_0xcb4789['depth']&&!(_0x937729===_0x157369(0x224)||_0x937729===_0x157369(0x2ac))&&(delete _0x5df2e5[_0x157369(0x24e)],_0x5df2e5[_0x157369(0x225)]=!0x0),_0x20bca3&&(_0x5df2e5[_0x157369(0x2c3)]=!0x0),_0x642c19=_0xcb4789[_0x157369(0x256)]['current'],_0xcb4789[_0x157369(0x256)][_0x157369(0x218)]=_0x5df2e5,this[_0x157369(0x251)](_0x5df2e5,_0xcb4789),_0x57be70[_0x157369(0x293)]){for(_0x1cc857=0x0,_0x4f181d=_0x57be70[_0x157369(0x293)];_0x1cc857<_0x4f181d;_0x1cc857++)_0x57be70[_0x1cc857](_0x1cc857);}_0x12e234['length']&&(_0x5df2e5[_0x157369(0x269)]=_0x12e234);}catch(_0x4c6312){_0x525b94(_0x4c6312,_0x5df2e5,_0xcb4789);}return this['_additionalMetadata'](_0x28d843,_0x5df2e5),this['_treeNodePropertiesAfterFullValue'](_0x5df2e5,_0xcb4789),_0xcb4789[_0x157369(0x256)]['current']=_0x642c19,_0xcb4789[_0x157369(0x216)]--,_0xcb4789[_0x157369(0x2b1)]=_0x7c527c,_0xcb4789[_0x157369(0x2b1)]&&_0xcb4789[_0x157369(0x260)][_0x157369(0x299)](),_0x5df2e5;}['_getOwnPropertySymbols'](_0x98a2ac){var _0x5699af=_0x2623df;return Object[_0x5699af(0x29e)]?Object['getOwnPropertySymbols'](_0x98a2ac):[];}[_0x2623df(0x21c)](_0x1b06f2){var _0x45deb3=_0x2623df;return!!(_0x1b06f2&&_0x37d624[_0x45deb3(0x1fd)]&&this[_0x45deb3(0x243)](_0x1b06f2)===_0x45deb3(0x259)&&_0x1b06f2[_0x45deb3(0x206)]);}[_0x2623df(0x294)](_0x2a16f8,_0x2d32bc,_0xc52e10){var _0x1da585=_0x2623df;return _0xc52e10['noFunctions']?typeof _0x2a16f8[_0x2d32bc]==_0x1da585(0x1fa):!0x1;}[_0x2623df(0x2d3)](_0x3c584c){var _0x4a2b0b=_0x2623df,_0x116724='';return _0x116724=typeof _0x3c584c,_0x116724===_0x4a2b0b(0x1ff)?this[_0x4a2b0b(0x243)](_0x3c584c)==='[object\\x20Array]'?_0x116724=_0x4a2b0b(0x2df):this['_objectToString'](_0x3c584c)===_0x4a2b0b(0x2dc)?_0x116724='date':this[_0x4a2b0b(0x243)](_0x3c584c)===_0x4a2b0b(0x2d2)?_0x116724=_0x4a2b0b(0x232):_0x3c584c===null?_0x116724=_0x4a2b0b(0x224):_0x3c584c[_0x4a2b0b(0x20d)]&&(_0x116724=_0x3c584c[_0x4a2b0b(0x20d)][_0x4a2b0b(0x261)]||_0x116724):_0x116724===_0x4a2b0b(0x2ac)&&this[_0x4a2b0b(0x245)]&&_0x3c584c instanceof this[_0x4a2b0b(0x245)]&&(_0x116724=_0x4a2b0b(0x217)),_0x116724;}[_0x2623df(0x243)](_0xc200d5){var _0x4e9e8b=_0x2623df;return Object[_0x4e9e8b(0x1f7)][_0x4e9e8b(0x2b2)]['call'](_0xc200d5);}[_0x2623df(0x27d)](_0x529a22){var _0x5c1d83=_0x2623df;return _0x529a22===_0x5c1d83(0x234)||_0x529a22===_0x5c1d83(0x28a)||_0x529a22===_0x5c1d83(0x246);}[_0x2623df(0x2db)](_0x138149){var _0x4a144e=_0x2623df;return _0x138149===_0x4a144e(0x284)||_0x138149===_0x4a144e(0x21e)||_0x138149===_0x4a144e(0x201);}[_0x2623df(0x23a)](_0x135627,_0x29b532,_0x21cfc1,_0x11f9fb,_0x375c3c,_0x438524){var _0x2e6ca4=this;return function(_0x3cef10){var _0xcb4898=_0x1765,_0x47c646=_0x375c3c[_0xcb4898(0x256)]['current'],_0x4083d7=_0x375c3c['node']['index'],_0x5280a8=_0x375c3c[_0xcb4898(0x256)][_0xcb4898(0x2ca)];_0x375c3c[_0xcb4898(0x256)][_0xcb4898(0x2ca)]=_0x47c646,_0x375c3c['node'][_0xcb4898(0x28c)]=typeof _0x11f9fb=='number'?_0x11f9fb:_0x3cef10,_0x135627[_0xcb4898(0x258)](_0x2e6ca4['_property'](_0x29b532,_0x21cfc1,_0x11f9fb,_0x375c3c,_0x438524)),_0x375c3c[_0xcb4898(0x256)][_0xcb4898(0x2ca)]=_0x5280a8,_0x375c3c[_0xcb4898(0x256)]['index']=_0x4083d7;};}[_0x2623df(0x1ef)](_0x5f50f6,_0x19f62d,_0x22009e,_0x1ee267,_0x153ede,_0x195a04,_0x145f61){var _0x1b819d=_0x2623df,_0x2f2a63=this;return _0x19f62d[_0x1b819d(0x2b4)+_0x153ede[_0x1b819d(0x2b2)]()]=!0x0,function(_0x52cd65){var _0xc2af59=_0x1b819d,_0xf1884d=_0x195a04['node'][_0xc2af59(0x218)],_0x1f5c05=_0x195a04['node'][_0xc2af59(0x28c)],_0x20b47d=_0x195a04[_0xc2af59(0x256)][_0xc2af59(0x2ca)];_0x195a04[_0xc2af59(0x256)]['parent']=_0xf1884d,_0x195a04['node'][_0xc2af59(0x28c)]=_0x52cd65,_0x5f50f6[_0xc2af59(0x258)](_0x2f2a63[_0xc2af59(0x207)](_0x22009e,_0x1ee267,_0x153ede,_0x195a04,_0x145f61)),_0x195a04[_0xc2af59(0x256)][_0xc2af59(0x2ca)]=_0x20b47d,_0x195a04['node'][_0xc2af59(0x28c)]=_0x1f5c05;};}['_property'](_0x29f600,_0x5a186a,_0x18094d,_0x4c36b3,_0x5d29b6){var _0x855d23=_0x2623df,_0x537e61=this;_0x5d29b6||(_0x5d29b6=function(_0x534676,_0x2f0f3c){return _0x534676[_0x2f0f3c];});var _0x3dad2b=_0x18094d['toString'](),_0x196ba1=_0x4c36b3[_0x855d23(0x2c8)]||{},_0x3e68f2=_0x4c36b3['depth'],_0x4ae156=_0x4c36b3[_0x855d23(0x2c6)];try{var _0x46f2e7=this[_0x855d23(0x2aa)](_0x29f600),_0x21c63a=_0x3dad2b;_0x46f2e7&&_0x21c63a[0x0]==='\\x27'&&(_0x21c63a=_0x21c63a['substr'](0x1,_0x21c63a[_0x855d23(0x293)]-0x2));var _0x51b35c=_0x4c36b3[_0x855d23(0x2c8)]=_0x196ba1['_p_'+_0x21c63a];_0x51b35c&&(_0x4c36b3[_0x855d23(0x230)]=_0x4c36b3[_0x855d23(0x230)]+0x1),_0x4c36b3['isExpressionToEvaluate']=!!_0x51b35c;var _0x4102a5=typeof _0x18094d==_0x855d23(0x28e),_0x10aa24={'name':_0x4102a5||_0x46f2e7?_0x3dad2b:this[_0x855d23(0x1f6)](_0x3dad2b)};if(_0x4102a5&&(_0x10aa24['symbol']=!0x0),!(_0x5a186a===_0x855d23(0x2df)||_0x5a186a==='Error')){var _0x4f0a95=this['_getOwnPropertyDescriptor'](_0x29f600,_0x18094d);if(_0x4f0a95&&(_0x4f0a95[_0x855d23(0x2be)]&&(_0x10aa24['setter']=!0x0),_0x4f0a95['get']&&!_0x51b35c&&!_0x4c36b3[_0x855d23(0x26e)]))return _0x10aa24[_0x855d23(0x2a8)]=!0x0,this[_0x855d23(0x248)](_0x10aa24,_0x4c36b3),_0x10aa24;}var _0x8e1bdc;try{_0x8e1bdc=_0x5d29b6(_0x29f600,_0x18094d);}catch(_0x343ade){return _0x10aa24={'name':_0x3dad2b,'type':_0x855d23(0x27e),'error':_0x343ade[_0x855d23(0x2ce)]},this[_0x855d23(0x248)](_0x10aa24,_0x4c36b3),_0x10aa24;}var _0x4c95a3=this[_0x855d23(0x2d3)](_0x8e1bdc),_0x39d7f9=this[_0x855d23(0x27d)](_0x4c95a3);if(_0x10aa24[_0x855d23(0x24c)]=_0x4c95a3,_0x39d7f9)this[_0x855d23(0x248)](_0x10aa24,_0x4c36b3,_0x8e1bdc,function(){var _0x294840=_0x855d23;_0x10aa24['value']=_0x8e1bdc[_0x294840(0x1f2)](),!_0x51b35c&&_0x537e61['_capIfString'](_0x4c95a3,_0x10aa24,_0x4c36b3,{});});else{var _0x308b70=_0x4c36b3[_0x855d23(0x2b1)]&&_0x4c36b3[_0x855d23(0x216)]<_0x4c36b3[_0x855d23(0x240)]&&_0x4c36b3['autoExpandPreviousObjects'][_0x855d23(0x2a0)](_0x8e1bdc)<0x0&&_0x4c95a3!==_0x855d23(0x1fa)&&_0x4c36b3[_0x855d23(0x250)]<_0x4c36b3[_0x855d23(0x233)];_0x308b70||_0x4c36b3['level']<_0x3e68f2||_0x51b35c?(this[_0x855d23(0x20a)](_0x10aa24,_0x8e1bdc,_0x4c36b3,_0x51b35c||{}),this[_0x855d23(0x213)](_0x8e1bdc,_0x10aa24)):this[_0x855d23(0x248)](_0x10aa24,_0x4c36b3,_0x8e1bdc,function(){var _0x40e642=_0x855d23;_0x4c95a3===_0x40e642(0x224)||_0x4c95a3===_0x40e642(0x2ac)||(delete _0x10aa24[_0x40e642(0x24e)],_0x10aa24[_0x40e642(0x225)]=!0x0);});}return _0x10aa24;}finally{_0x4c36b3[_0x855d23(0x2c8)]=_0x196ba1,_0x4c36b3[_0x855d23(0x230)]=_0x3e68f2,_0x4c36b3[_0x855d23(0x2c6)]=_0x4ae156;}}[_0x2623df(0x26d)](_0x2f7d2a,_0x3e2111,_0x4f06a4,_0x165e3c){var _0x1a3fe5=_0x2623df,_0x4cb626=_0x165e3c[_0x1a3fe5(0x2c4)]||_0x4f06a4[_0x1a3fe5(0x2c4)];if((_0x2f7d2a===_0x1a3fe5(0x28a)||_0x2f7d2a==='String')&&_0x3e2111['value']){let _0x39d5f7=_0x3e2111[_0x1a3fe5(0x24e)][_0x1a3fe5(0x293)];_0x4f06a4['allStrLength']+=_0x39d5f7,_0x4f06a4[_0x1a3fe5(0x214)]>_0x4f06a4[_0x1a3fe5(0x2c9)]?(_0x3e2111[_0x1a3fe5(0x225)]='',delete _0x3e2111['value']):_0x39d5f7>_0x4cb626&&(_0x3e2111['capped']=_0x3e2111[_0x1a3fe5(0x24e)][_0x1a3fe5(0x219)](0x0,_0x4cb626),delete _0x3e2111[_0x1a3fe5(0x24e)]);}}['_isMap'](_0x34931b){var _0x3272ed=_0x2623df;return!!(_0x34931b&&_0x37d624[_0x3272ed(0x247)]&&this[_0x3272ed(0x243)](_0x34931b)===_0x3272ed(0x2d4)&&_0x34931b['forEach']);}[_0x2623df(0x1f6)](_0x47a998){var _0x54c731=_0x2623df;if(_0x47a998[_0x54c731(0x263)](/^\\d+$/))return _0x47a998;var _0x13c78f;try{_0x13c78f=JSON['stringify'](''+_0x47a998);}catch{_0x13c78f='\\x22'+this[_0x54c731(0x243)](_0x47a998)+'\\x22';}return _0x13c78f[_0x54c731(0x263)](/^\"([a-zA-Z_][a-zA-Z_0-9]*)\"$/)?_0x13c78f=_0x13c78f['substr'](0x1,_0x13c78f['length']-0x2):_0x13c78f=_0x13c78f['replace'](/'/g,'\\x5c\\x27')[_0x54c731(0x278)](/\\\\\"/g,'\\x22')['replace'](/(^\"|\"$)/g,'\\x27'),_0x13c78f;}[_0x2623df(0x248)](_0x450bd2,_0x540e99,_0x3a738d,_0x1d5e7b){var _0xbf57c1=_0x2623df;this[_0xbf57c1(0x251)](_0x450bd2,_0x540e99),_0x1d5e7b&&_0x1d5e7b(),this[_0xbf57c1(0x213)](_0x3a738d,_0x450bd2),this[_0xbf57c1(0x2b5)](_0x450bd2,_0x540e99);}['_treeNodePropertiesBeforeFullValue'](_0x288bd4,_0x443233){var _0x15c053=_0x2623df;this[_0x15c053(0x2ab)](_0x288bd4,_0x443233),this[_0x15c053(0x22b)](_0x288bd4,_0x443233),this['_setNodeExpressionPath'](_0x288bd4,_0x443233),this[_0x15c053(0x275)](_0x288bd4,_0x443233);}[_0x2623df(0x2ab)](_0x33355c,_0x4c1413){}['_setNodeQueryPath'](_0x5e28c0,_0x37c1ca){}['_setNodeLabel'](_0xee885f,_0x115998){}[_0x2623df(0x235)](_0x55a938){var _0x1aa6f4=_0x2623df;return _0x55a938===this[_0x1aa6f4(0x270)];}['_treeNodePropertiesAfterFullValue'](_0x10edfb,_0x29f29a){var _0x206d02=_0x2623df;this[_0x206d02(0x1ed)](_0x10edfb,_0x29f29a),this['_setNodeExpandableState'](_0x10edfb),_0x29f29a['sortProps']&&this[_0x206d02(0x2cb)](_0x10edfb),this[_0x206d02(0x29c)](_0x10edfb,_0x29f29a),this[_0x206d02(0x236)](_0x10edfb,_0x29f29a),this[_0x206d02(0x209)](_0x10edfb);}[_0x2623df(0x213)](_0x2ae38c,_0x6a4e65){var _0x3180df=_0x2623df;let _0x39ab34;try{_0x37d624[_0x3180df(0x23c)]&&(_0x39ab34=_0x37d624[_0x3180df(0x23c)][_0x3180df(0x223)],_0x37d624[_0x3180df(0x23c)][_0x3180df(0x223)]=function(){}),_0x2ae38c&&typeof _0x2ae38c[_0x3180df(0x293)]==_0x3180df(0x246)&&(_0x6a4e65[_0x3180df(0x293)]=_0x2ae38c[_0x3180df(0x293)]);}catch{}finally{_0x39ab34&&(_0x37d624[_0x3180df(0x23c)][_0x3180df(0x223)]=_0x39ab34);}if(_0x6a4e65[_0x3180df(0x24c)]==='number'||_0x6a4e65[_0x3180df(0x24c)]==='Number'){if(isNaN(_0x6a4e65['value']))_0x6a4e65[_0x3180df(0x2bc)]=!0x0,delete _0x6a4e65['value'];else switch(_0x6a4e65[_0x3180df(0x24e)]){case Number[_0x3180df(0x23d)]:_0x6a4e65[_0x3180df(0x2dd)]=!0x0,delete _0x6a4e65[_0x3180df(0x24e)];break;case Number['NEGATIVE_INFINITY']:_0x6a4e65['negativeInfinity']=!0x0,delete _0x6a4e65[_0x3180df(0x24e)];break;case 0x0:this['_isNegativeZero'](_0x6a4e65[_0x3180df(0x24e)])&&(_0x6a4e65[_0x3180df(0x1fb)]=!0x0);break;}}else _0x6a4e65[_0x3180df(0x24c)]===_0x3180df(0x1fa)&&typeof _0x2ae38c[_0x3180df(0x261)]==_0x3180df(0x28a)&&_0x2ae38c[_0x3180df(0x261)]&&_0x6a4e65[_0x3180df(0x261)]&&_0x2ae38c[_0x3180df(0x261)]!==_0x6a4e65[_0x3180df(0x261)]&&(_0x6a4e65[_0x3180df(0x21b)]=_0x2ae38c[_0x3180df(0x261)]);}['_isNegativeZero'](_0x2fa98d){var _0x8c6a89=_0x2623df;return 0x1/_0x2fa98d===Number[_0x8c6a89(0x289)];}[_0x2623df(0x2cb)](_0x45f240){var _0x27ea15=_0x2623df;!_0x45f240[_0x27ea15(0x269)]||!_0x45f240['props'][_0x27ea15(0x293)]||_0x45f240[_0x27ea15(0x24c)]===_0x27ea15(0x2df)||_0x45f240[_0x27ea15(0x24c)]==='Map'||_0x45f240[_0x27ea15(0x24c)]===_0x27ea15(0x1fd)||_0x45f240[_0x27ea15(0x269)][_0x27ea15(0x296)](function(_0x587f85,_0x25310e){var _0x27429f=_0x27ea15,_0x22eb8f=_0x587f85['name'][_0x27429f(0x2a7)](),_0x9f76b=_0x25310e[_0x27429f(0x261)][_0x27429f(0x2a7)]();return _0x22eb8f<_0x9f76b?-0x1:_0x22eb8f>_0x9f76b?0x1:0x0;});}[_0x2623df(0x29c)](_0x6aec3b,_0x4e7839){var _0x5e1614=_0x2623df;if(!(_0x4e7839[_0x5e1614(0x1f0)]||!_0x6aec3b[_0x5e1614(0x269)]||!_0x6aec3b['props'][_0x5e1614(0x293)])){for(var _0x4ae259=[],_0x2bc8c5=[],_0x2c5219=0x0,_0x4f1485=_0x6aec3b[_0x5e1614(0x269)]['length'];_0x2c5219<_0x4f1485;_0x2c5219++){var _0x29e8fa=_0x6aec3b[_0x5e1614(0x269)][_0x2c5219];_0x29e8fa['type']===_0x5e1614(0x1fa)?_0x4ae259[_0x5e1614(0x258)](_0x29e8fa):_0x2bc8c5[_0x5e1614(0x258)](_0x29e8fa);}if(!(!_0x2bc8c5[_0x5e1614(0x293)]||_0x4ae259[_0x5e1614(0x293)]<=0x1)){_0x6aec3b[_0x5e1614(0x269)]=_0x2bc8c5;var _0x28eeff={'functionsNode':!0x0,'props':_0x4ae259};this['_setNodeId'](_0x28eeff,_0x4e7839),this[_0x5e1614(0x1ed)](_0x28eeff,_0x4e7839),this[_0x5e1614(0x229)](_0x28eeff),this[_0x5e1614(0x275)](_0x28eeff,_0x4e7839),_0x28eeff['id']+='\\x20f',_0x6aec3b['props']['unshift'](_0x28eeff);}}}[_0x2623df(0x236)](_0x8d09ca,_0x48c45f){}['_setNodeExpandableState'](_0x2c3113){}['_isArray'](_0x4d0b46){var _0x540da5=_0x2623df;return Array['isArray'](_0x4d0b46)||typeof _0x4d0b46==_0x540da5(0x1ff)&&this[_0x540da5(0x243)](_0x4d0b46)===_0x540da5(0x1fc);}['_setNodePermissions'](_0x51ec7c,_0x53542f){}[_0x2623df(0x209)](_0x47913e){var _0x503d84=_0x2623df;delete _0x47913e['_hasSymbolPropertyOnItsPath'],delete _0x47913e['_hasSetOnItsPath'],delete _0x47913e[_0x503d84(0x257)];}[_0x2623df(0x290)](_0x3e77fb,_0x7533ff){}}let _0x31638a=new _0x284754(),_0xdce57e={'props':0x64,'elements':0x64,'strLength':0x400*0x32,'totalStrLength':0x400*0x32,'autoExpandLimit':0x1388,'autoExpandMaxDepth':0xa},_0x43e197={'props':0x5,'elements':0x5,'strLength':0x100,'totalStrLength':0x100*0x3,'autoExpandLimit':0x1e,'autoExpandMaxDepth':0x2};function _0x6a9287(_0x531b46,_0x4bc71a,_0x197aa8,_0x42857c,_0x5321fe,_0x10f17e){var _0x471a36=_0x2623df;let _0x101e55,_0x1a2226;try{_0x1a2226=_0x2d8ac9(),_0x101e55=_0x23f5ef[_0x4bc71a],!_0x101e55||_0x1a2226-_0x101e55['ts']>0x1f4&&_0x101e55[_0x471a36(0x227)]&&_0x101e55[_0x471a36(0x27a)]/_0x101e55[_0x471a36(0x227)]<0x64?(_0x23f5ef[_0x4bc71a]=_0x101e55={'count':0x0,'time':0x0,'ts':_0x1a2226},_0x23f5ef[_0x471a36(0x2c0)]={}):_0x1a2226-_0x23f5ef[_0x471a36(0x2c0)]['ts']>0x32&&_0x23f5ef[_0x471a36(0x2c0)]['count']&&_0x23f5ef['hits'][_0x471a36(0x27a)]/_0x23f5ef[_0x471a36(0x2c0)][_0x471a36(0x227)]<0x64&&(_0x23f5ef['hits']={});let _0x11e3f6=[],_0x5697d2=_0x101e55['reduceLimits']||_0x23f5ef[_0x471a36(0x2c0)][_0x471a36(0x22a)]?_0x43e197:_0xdce57e,_0x405b05=_0x3da01f=>{var _0x3c6546=_0x471a36;let _0x26cba4={};return _0x26cba4['props']=_0x3da01f[_0x3c6546(0x269)],_0x26cba4[_0x3c6546(0x285)]=_0x3da01f[_0x3c6546(0x285)],_0x26cba4[_0x3c6546(0x2c4)]=_0x3da01f[_0x3c6546(0x2c4)],_0x26cba4[_0x3c6546(0x2c9)]=_0x3da01f['totalStrLength'],_0x26cba4[_0x3c6546(0x233)]=_0x3da01f[_0x3c6546(0x233)],_0x26cba4[_0x3c6546(0x240)]=_0x3da01f[_0x3c6546(0x240)],_0x26cba4['sortProps']=!0x1,_0x26cba4[_0x3c6546(0x1f0)]=!_0x425a99,_0x26cba4[_0x3c6546(0x230)]=0x1,_0x26cba4[_0x3c6546(0x216)]=0x0,_0x26cba4[_0x3c6546(0x238)]='root_exp_id',_0x26cba4[_0x3c6546(0x1ec)]=_0x3c6546(0x283),_0x26cba4[_0x3c6546(0x2b1)]=!0x0,_0x26cba4[_0x3c6546(0x260)]=[],_0x26cba4[_0x3c6546(0x250)]=0x0,_0x26cba4[_0x3c6546(0x26e)]=!0x0,_0x26cba4[_0x3c6546(0x214)]=0x0,_0x26cba4['node']={'current':void 0x0,'parent':void 0x0,'index':0x0},_0x26cba4;};for(var _0x23e276=0x0;_0x23e276<_0x5321fe[_0x471a36(0x293)];_0x23e276++)_0x11e3f6[_0x471a36(0x258)](_0x31638a[_0x471a36(0x20a)]({'timeNode':_0x531b46===_0x471a36(0x27a)||void 0x0},_0x5321fe[_0x23e276],_0x405b05(_0x5697d2),{}));if(_0x531b46==='trace'||_0x531b46===_0x471a36(0x223)){let _0x56cb28=Error['stackTraceLimit'];try{Error[_0x471a36(0x281)]=0x1/0x0,_0x11e3f6['push'](_0x31638a[_0x471a36(0x20a)]({'stackNode':!0x0},new Error()[_0x471a36(0x1f3)],_0x405b05(_0x5697d2),{'strLength':0x1/0x0}));}finally{Error[_0x471a36(0x281)]=_0x56cb28;}}return{'method':_0x471a36(0x242),'version':_0x2ae763,'args':[{'ts':_0x197aa8,'session':_0x42857c,'args':_0x11e3f6,'id':_0x4bc71a,'context':_0x10f17e}]};}catch(_0x141361){return{'method':_0x471a36(0x242),'version':_0x2ae763,'args':[{'ts':_0x197aa8,'session':_0x42857c,'args':[{'type':'unknown','error':_0x141361&&_0x141361[_0x471a36(0x2ce)]}],'id':_0x4bc71a,'context':_0x10f17e}]};}finally{try{if(_0x101e55&&_0x1a2226){let _0x53d3d0=_0x2d8ac9();_0x101e55['count']++,_0x101e55[_0x471a36(0x27a)]+=_0x1be918(_0x1a2226,_0x53d3d0),_0x101e55['ts']=_0x53d3d0,_0x23f5ef[_0x471a36(0x2c0)][_0x471a36(0x227)]++,_0x23f5ef[_0x471a36(0x2c0)][_0x471a36(0x27a)]+=_0x1be918(_0x1a2226,_0x53d3d0),_0x23f5ef[_0x471a36(0x2c0)]['ts']=_0x53d3d0,(_0x101e55['count']>0x32||_0x101e55['time']>0x64)&&(_0x101e55[_0x471a36(0x22a)]=!0x0),(_0x23f5ef['hits'][_0x471a36(0x227)]>0x3e8||_0x23f5ef[_0x471a36(0x2c0)][_0x471a36(0x27a)]>0x12c)&&(_0x23f5ef['hits'][_0x471a36(0x22a)]=!0x0);}}catch{}}}return _0x6a9287;}((_0x5c57ad,_0x1873d7,_0x288199,_0xbac8a7,_0x3deb3c,_0x598d24,_0x5d532f,_0x146311,_0x5c841c,_0x435457,_0x4af095)=>{var _0x178280=_0x52c85b;if(_0x5c57ad[_0x178280(0x273)])return _0x5c57ad[_0x178280(0x273)];if(!H(_0x5c57ad,_0x146311,_0x3deb3c))return _0x5c57ad[_0x178280(0x273)]={'consoleLog':()=>{},'consoleTrace':()=>{},'consoleTime':()=>{},'consoleTimeEnd':()=>{},'autoLog':()=>{},'autoLogMany':()=>{},'autoTraceMany':()=>{},'coverage':()=>{},'autoTrace':()=>{},'autoTime':()=>{},'autoTimeEnd':()=>{}},_0x5c57ad['_console_ninja'];let _0x348138=B(_0x5c57ad),_0x4526fb=_0x348138[_0x178280(0x26b)],_0x4d4ffb=_0x348138[_0x178280(0x282)],_0x383918=_0x348138[_0x178280(0x2cc)],_0x42c1e2={'hits':{},'ts':{}},_0x5f1ccb=X(_0x5c57ad,_0x5c841c,_0x42c1e2,_0x598d24),_0xd940d5=_0x4e24ec=>{_0x42c1e2['ts'][_0x4e24ec]=_0x4d4ffb();},_0xea84f2=(_0x1e4f3c,_0x4cf578)=>{var _0x1bcce6=_0x178280;let _0x930c06=_0x42c1e2['ts'][_0x4cf578];if(delete _0x42c1e2['ts'][_0x4cf578],_0x930c06){let _0x1303d4=_0x4526fb(_0x930c06,_0x4d4ffb());_0xde4346(_0x5f1ccb(_0x1bcce6(0x27a),_0x1e4f3c,_0x383918(),_0x42be99,[_0x1303d4],_0x4cf578));}},_0x4f0396=_0x430740=>{var _0x16daef=_0x178280,_0x326829;return _0x3deb3c===_0x16daef(0x22f)&&_0x5c57ad[_0x16daef(0x2bf)]&&((_0x326829=_0x430740==null?void 0x0:_0x430740[_0x16daef(0x264)])==null?void 0x0:_0x326829[_0x16daef(0x293)])&&(_0x430740[_0x16daef(0x264)][0x0]['origin']=_0x5c57ad[_0x16daef(0x2bf)]),_0x430740;};_0x5c57ad['_console_ninja']={'consoleLog':(_0x389383,_0x33070f)=>{var _0xcc2784=_0x178280;_0x5c57ad[_0xcc2784(0x23c)]['log']['name']!=='disabledLog'&&_0xde4346(_0x5f1ccb(_0xcc2784(0x242),_0x389383,_0x383918(),_0x42be99,_0x33070f));},'consoleTrace':(_0x5a7462,_0x4ad9a0)=>{var _0x34222f=_0x178280,_0x4e5f09,_0x38cb70;_0x5c57ad['console']['log'][_0x34222f(0x261)]!==_0x34222f(0x286)&&((_0x38cb70=(_0x4e5f09=_0x5c57ad['process'])==null?void 0x0:_0x4e5f09[_0x34222f(0x249)])!=null&&_0x38cb70[_0x34222f(0x256)]&&(_0x5c57ad['_ninjaIgnoreNextError']=!0x0),_0xde4346(_0x4f0396(_0x5f1ccb(_0x34222f(0x239),_0x5a7462,_0x383918(),_0x42be99,_0x4ad9a0))));},'consoleError':(_0x56c660,_0x124401)=>{var _0x5a4dbf=_0x178280;_0x5c57ad[_0x5a4dbf(0x267)]=!0x0,_0xde4346(_0x4f0396(_0x5f1ccb(_0x5a4dbf(0x223),_0x56c660,_0x383918(),_0x42be99,_0x124401)));},'consoleTime':_0x2b72bf=>{_0xd940d5(_0x2b72bf);},'consoleTimeEnd':(_0xf42d7f,_0x231d2e)=>{_0xea84f2(_0x231d2e,_0xf42d7f);},'autoLog':(_0x34fc42,_0x1593ab)=>{_0xde4346(_0x5f1ccb('log',_0x1593ab,_0x383918(),_0x42be99,[_0x34fc42]));},'autoLogMany':(_0x1161f8,_0x1f890f)=>{var _0x432033=_0x178280;_0xde4346(_0x5f1ccb(_0x432033(0x242),_0x1161f8,_0x383918(),_0x42be99,_0x1f890f));},'autoTrace':(_0x1abd02,_0x1a1339)=>{var _0x23dceb=_0x178280;_0xde4346(_0x4f0396(_0x5f1ccb(_0x23dceb(0x239),_0x1a1339,_0x383918(),_0x42be99,[_0x1abd02])));},'autoTraceMany':(_0x5662b6,_0x1b0d24)=>{_0xde4346(_0x4f0396(_0x5f1ccb('trace',_0x5662b6,_0x383918(),_0x42be99,_0x1b0d24)));},'autoTime':(_0x4a4e0b,_0x1660f1,_0xecbc72)=>{_0xd940d5(_0xecbc72);},'autoTimeEnd':(_0x391986,_0x4e8b70,_0x41f58e)=>{_0xea84f2(_0x4e8b70,_0x41f58e);},'coverage':_0x5ae8d0=>{var _0x294a69=_0x178280;_0xde4346({'method':_0x294a69(0x203),'version':_0x598d24,'args':[{'id':_0x5ae8d0}]});}};let _0xde4346=q(_0x5c57ad,_0x1873d7,_0x288199,_0xbac8a7,_0x3deb3c,_0x435457,_0x4af095),_0x42be99=_0x5c57ad[_0x178280(0x29d)];return _0x5c57ad[_0x178280(0x273)];})(globalThis,_0x52c85b(0x28b),_0x52c85b(0x28d),_0x52c85b(0x27b),_0x52c85b(0x2b8),'1.0.0',_0x52c85b(0x212),[\"localhost\",\"127.0.0.1\",\"example.cypress.io\",\"Omers-MacBook-Pro.local\",\"10.0.0.9\"],_0x52c85b(0x265),_0x52c85b(0x24f),'1');");
}
catch (e) { } }
;
function oo_oo(i, ...v) { try {
    oo_cm().consoleLog(i, v);
}
catch (e) { } return v; }
;
oo_oo;
function oo_tr(i, ...v) { try {
    oo_cm().consoleTrace(i, v);
}
catch (e) { } return v; }
;
oo_tr;
function oo_tx(i, ...v) { try {
    oo_cm().consoleError(i, v);
}
catch (e) { } return v; }
;
oo_tx;
function oo_ts(v) { try {
    oo_cm().consoleTime(v);
}
catch (e) { } return v; }
;
oo_ts;
function oo_te(v, i) { try {
    oo_cm().consoleTimeEnd(v, i);
}
catch (e) { } return v; }
;
oo_te;
//# sourceMappingURL=schedule.service.js.map