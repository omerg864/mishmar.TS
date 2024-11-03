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
const core_1 = require("@hebcal/core");
let ScheduleService = class ScheduleService {
    constructor(scheduleModel, structureModel, userModel, settingsModel, reinforcementModel) {
        this.scheduleModel = scheduleModel;
        this.structureModel = structureModel;
        this.userModel = userModel;
        this.settingsModel = settingsModel;
        this.reinforcementModel = reinforcementModel;
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
        const [reinforcements, days, schedule] = await Promise.all([
            this.getReinforcement(schedule_found),
            this.calculateDays(schedule_found),
            this.populateSchedule(schedule_found),
        ]);
        return { schedule: Object.assign(Object.assign({}, schedule), { days }), pages, reinforcements };
    }
    async getReinforcement(schedule) {
        let reinforcements = [];
        let reinforcements_found = await this.reinforcementModel.find({
            schedule: schedule._id,
        }).sort({ week: 1, day: 1 });
        for (let i = 0; i < schedule.num_weeks; i++) {
            reinforcements.push([]);
            for (let j = 0; j < 7; j++) {
                reinforcements[i].push([]);
                let found = reinforcements_found.filter((reinforcement) => reinforcement.week === i && reinforcement.day === j);
                if (found.length > 0) {
                    reinforcements[i][j] = found;
                }
                else {
                    reinforcements[i][j] = null;
                }
            }
        }
        return reinforcements;
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
            console.log(error);
            throw new common_1.ConflictException('שגיאה בקריאת הקובץ', error.message);
        }
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
        let reinforcements;
        await this.scheduleModel.find({
            schedule: schedule._id
        });
        [reinforcements, schedule] = await Promise.all([
            this.reinforcementModel.find({
                schedule: schedule._id
            }),
            this.populateSchedule(schedule)
        ]);
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
        for (let i = 0; i < reinforcements.length; i++) {
            if (!reinforcements[i]) {
                continue;
            }
            const names_re = reinforcements[i].names.split('\n');
            const shift = reinforcements[i].shift;
            const day = reinforcements[i].day;
            for (let j = 0; j < names_re.length; j++) {
                if (!names.includes(names_re[j])) {
                    names.push(names_re[j]);
                    counts.push(Object.assign({ name: names_re[j], night: 0, weekend: 0 }, resetObj));
                }
                const index = names.indexOf(names_re[j]);
                switch (shift) {
                    case 0:
                        if (day !== 6) {
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
                        if (day < 5) {
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
                        if (day < 5) {
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
        let schedule_found = await this.scheduleModel.findById(id);
        if (!schedule_found) {
            throw new common_1.NotFoundException('סידור לא נמצא');
        }
        const [reinforcements, schedule, days] = await Promise.all([
            this.getReinforcement(schedule_found),
            this.populateSchedule(schedule_found),
            this.calculateDays(schedule_found),
        ]);
        return { schedule: Object.assign(Object.assign({}, schedule), { days }), reinforcements };
    }
    async getShifts(date) {
        const shifts = {};
        const startDate = (0, dayjs_1.default)(new Date(date.year, date.month, 1))
            .subtract(14, 'day')
            .toDate();
        const endDate = new Date(date.year, date.month, 32);
        const schedules = await this.scheduleModel.find({
            date: { $gte: startDate, $lte: endDate },
        });
        const location = core_1.Location.lookup('Tel Aviv');
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
                    if (!structs[shift.shift]) {
                        continue;
                    }
                    const shiftType = structs[shift.shift].shift;
                    if (shiftType === 3) {
                        continue;
                    }
                    for (let l = 0; l < shift.days.length; l++) {
                        const names = shift.days[l]
                            .split('\n')
                            .filter((x) => x.length > 0);
                        const dateShift = (0, dayjs_1.default)(schedules[i].date)
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
                        const events = core_1.HebrewCalendar.calendar(options);
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
                                    if (shiftType === 0 || shiftType === 1) {
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
                                if (day === 6 &&
                                    (shiftType === 0 || shiftType === 1)) {
                                    shifts[names[m]].weekend_day += 1;
                                }
                                if ((day === 6 || day === 5) &&
                                    shiftType === 2) {
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
                    const dateShift = (0, dayjs_1.default)(schedules[i].date)
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
                        const events = core_1.HebrewCalendar.calendar(options);
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
                                    if (shiftType === 0 || shiftType === 1) {
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
                                if (day === 6 &&
                                    (shiftType === 0 || shiftType === 1)) {
                                    shifts[names[t]].weekend_day_re += 1;
                                }
                                if ((day === 6 || day === 5) && shiftType === 2) {
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
    async update(schedule, reinforcements, deletedReinforcements, reset) {
        let scheduleFound = await this.scheduleModel.findById(schedule._id);
        if (!scheduleFound) {
            throw new common_1.NotFoundException('סידור לא נמצא');
        }
        let scheduleUpdate, reinforcementsUpdate;
        let newReinforcements;
        if (!reset) {
            [scheduleUpdate, reinforcementsUpdate] = await Promise.all([
                this.scheduleModel.findByIdAndUpdate(schedule._id, schedule),
                this.createAndUpdateReinforcements(reinforcements, schedule),
                this.deleteReinforcements(deletedReinforcements)
            ]);
            newReinforcements = await this.getReinforcement(scheduleFound);
        }
        else {
            [scheduleUpdate, reinforcementsUpdate] = await Promise.all([
                this.scheduleModel.findByIdAndUpdate(schedule._id, schedule),
                this.reinforcementModel.deleteMany({ schedule: schedule._id })
            ]);
            newReinforcements = [];
        }
        if (!scheduleUpdate || !reinforcementsUpdate.success) {
            if (reset) {
                newReinforcements = await this.getReinforcement(scheduleFound);
            }
            return { success: false, reinforcements: newReinforcements };
        }
        return { success: true, reinforcements: newReinforcements };
    }
    async createAndUpdateReinforcements(reinforcements, schedule) {
        let promises = [];
        for (let i = 0; i < reinforcements.length; i++) {
            if (reinforcements[i]._id) {
                promises.push(this.updateReinforcement(reinforcements[i]));
            }
            else {
                promises.push(this.createReinforcement(reinforcements[i], schedule));
            }
        }
        await Promise.all(promises);
        return { success: true };
    }
    async deleteReinforcements(reinforcements) {
        let promises = [];
        for (let i = 0; i < reinforcements.length; i++) {
            promises.push(this.reinforcementModel.findByIdAndDelete(reinforcements[i]._id));
        }
        await Promise.all(promises);
        return { success: true };
    }
    async updateReinforcement(reinforcement) {
        let reinforcement_found = await this.reinforcementModel.findById(reinforcement._id);
        if (!reinforcement_found) {
            return { success: false };
        }
        await this.reinforcementModel.findByIdAndUpdate(reinforcement._id, reinforcement);
        return { success: true };
    }
    async createReinforcement(reinforcement, schedule) {
        const newReinforcement = await this.reinforcementModel.create(Object.assign(Object.assign({}, reinforcement), { schedule: schedule._id }));
        return newReinforcement;
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
    __param(4, (0, mongoose_1.InjectModel)('Reinforcement')),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model])
], ScheduleService);
exports.ScheduleService = ScheduleService;
//# sourceMappingURL=schedule.service.js.map