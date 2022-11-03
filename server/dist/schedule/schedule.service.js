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
const XLSX = require("xlsx");
const excel = require("excel4node");
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
            throw new common_1.NotFoundException('לא נמצאו סידורים');
        }
        let index = 0;
        if (!all_schedules[index].publish) {
            index = 1;
            if (all_schedules.length === 1) {
                throw new common_1.ConflictException('אין סידורים מפורסמים עדיין');
            }
        }
        let pages = all_schedules.length - index;
        let schedule_found = (await this.scheduleModel.find().sort({ date: -1 }).skip(query.page + index).limit(1))[0];
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
        let schedules = await this.scheduleModel.find().sort({ date: -1 }).skip(query.page * 5).limit(5).select('-weeks');
        return { schedules, pages };
    }
    async getLast() {
        let schedules = await this.scheduleModel.find().sort({ date: -1 }).select('-weeks');
        if (schedules.length === 0) {
            throw new common_1.ConflictException('לא נמצאו סידורים');
        }
        let days = this.calculateDays(schedules[0]);
        return Object.assign(Object.assign({}, schedules[0]["_doc"]), { days });
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
            if (stop === "") {
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
                extractedData[week][day][shift].push({ name: cell === null || cell === void 0 ? void 0 : cell.v, pull: true, seq: false });
            }
            if (((_d = (_c = cell === null || cell === void 0 ? void 0 : cell.s) === null || _c === void 0 ? void 0 : _c.fgColor) === null || _d === void 0 ? void 0 : _d.rgb) === 'FFEB9C') {
                extractedData[week][day][shift].push({ name: cell === null || cell === void 0 ? void 0 : cell.v, pull: false, seq: false });
            }
        }
        return extractedData;
    }
    extractDataFromExcel(file, num_weeks) {
        const fileRead = XLSX.read(file.buffer, { type: 'buffer', cellStyles: true });
        const ws = fileRead.Sheets["Sheet1"];
        if (!ws) {
            throw new common_1.NotFoundException('שם העמוד צריך להיות Sheet1');
        }
        let endNames = { morning: 5, noon: 5, night: 5 };
        let temps = { cell: ws.A5, index: 5 };
        temps = this.getEndShiftExcel(ws, temps.cell, temps.index, "צהריים");
        endNames.morning = temps.index - 1;
        temps = this.getEndShiftExcel(ws, temps.cell, temps.index, "לילה");
        endNames.noon = temps.index - 1;
        temps = this.getEndShiftExcel(ws, temps.cell, temps.index, "");
        endNames.night = temps.index - 1;
        let extractedData = this.getEmptyWeeksArrayShifts(num_weeks);
        let weekNumber = 0;
        for (let i = 2; i < num_weeks * 7 + 2; i++) {
            if ((weekNumber === 0 ? i - 1 : i) % 8 === 0)
                weekNumber += 1;
            let day = i - 2 - weekNumber * 7;
            extractedData = this.searchExcelShift(ws, 5, endNames.morning, i, weekNumber, day, extractedData, "morning");
            extractedData = this.searchExcelShift(ws, endNames.morning + 1, endNames.noon, i, weekNumber, day, extractedData, "noon");
            extractedData = this.searchExcelShift(ws, endNames.noon + 1, endNames.night, i, weekNumber, day, extractedData, "night");
        }
        return extractedData;
    }
    assignToShifts(shiftType, shifts, data, inShift, day, week, managers_names, weeks_tmp, settings) {
        let managerShifts = shifts.filter(structure => structure.shift.manager);
        if (this.compareTwoArrays(managers_names, data[week][day][shiftType].map(user => user.name)).length) {
            let temp_names = this.compareTwoArrays(managers_names, data[week][day][shiftType].map(user => user.name));
            for (let k = 0; k < managerShifts.length; k++) {
                if (temp_names.length !== 0) {
                    let rndIndex = (0, functions_1.getRandomIndex)(temp_names.length);
                    weeks_tmp[week] = weeks_tmp[week].map(shift => {
                        if (shift.shift._id === managerShifts[k].shift._id) {
                            let split = shift.days[day].split("\n").filter(name => name != '');
                            split.push(temp_names[rndIndex]);
                            shift.days[day] = split.join('\n');
                            inShift.push(temp_names[rndIndex]);
                            data[week][day][shiftType] = data[week][day][shiftType].filter(user => user.name !== temp_names[rndIndex]);
                            temp_names = temp_names.filter((_, index) => index !== rndIndex);
                        }
                        return shift;
                    });
                }
            }
        }
        else if (data[week][day][shiftType].filter(user => user.name === settings.officer).length && managerShifts.length && settings.officer) {
            weeks_tmp[week] = weeks_tmp[week].map(shift => {
                if (shift.shift._id === managerShifts[0].shift._id) {
                    let split = shift.days[day].split("\n").filter(name => name != '');
                    split.push(settings.officer);
                    shift.days[day] = split.join('\n');
                    inShift.push(settings.officer);
                    data[week][day][shiftType] = data[week][day][shiftType].filter(user => user.name !== settings.officer);
                }
                return shift;
            });
        }
        if (data[week][day][shiftType].length > 0) {
            let openingShifts = shifts.filter(structure => structure.shift.opening);
            let temp_names = data[week][day][shiftType].filter(user => !managers_names.includes(user.name));
            if (temp_names.length < openingShifts.length) {
                temp_names = data[week][day][shiftType];
            }
            for (let k = 0; k < openingShifts.length; k++) {
                let rndIndex = (0, functions_1.getRandomIndex)(temp_names.length);
                weeks_tmp[week] = weeks_tmp[week].map(shift => {
                    if (shift.shift._id === openingShifts[k].shift._id) {
                        let split = shift.days[day].split("\n").filter(name => name != '');
                        split.push(temp_names[rndIndex].name);
                        shift.days[day] = split.join('\n');
                        inShift.push(temp_names[rndIndex].name);
                        data[week][day][shiftType] = data[week][day][shiftType].filter(user => user.name !== temp_names[rndIndex].name);
                        temp_names = temp_names.filter((_, index) => index !== rndIndex);
                    }
                    return shift;
                });
            }
        }
        if (data[week][day][shiftType].length > 0) {
            let temp_names = data[week][day][shiftType].filter(user => user.pull);
            if (temp_names.length > 0) {
                let pullShifts = shifts.filter(structure => structure.shift.pull);
                for (let k = 0; k < pullShifts.length; k++) {
                    let rndIndex = (0, functions_1.getRandomIndex)(temp_names.length);
                    weeks_tmp[week] = weeks_tmp[week].map(shift => {
                        if (shift.shift._id === pullShifts[k].shift._id) {
                            let split = shift.days[day].split("\n").filter(name => name != '');
                            split.push(temp_names[rndIndex].name);
                            shift.days[day] = split.join('\n');
                            inShift.push(temp_names[rndIndex].name);
                            data[week][day][shiftType] = data[week][day][shiftType].filter(user => user.name !== temp_names[rndIndex].name);
                            temp_names = temp_names.filter((_, index) => index !== rndIndex);
                        }
                        return shift;
                    });
                }
            }
        }
        if (data[week][day][shiftType].length > 0) {
            let shiftsLeft = shifts.filter(shift => !shift.shift.pull && !shift.shift.manager && !shift.shift.opening);
            for (let k = 0; k < shiftsLeft.length; k++) {
                if (data[week][day][shiftType].length === 0)
                    break;
                if (k === shiftsLeft.length - 1) {
                    let tempData = [...data[week][day][shiftType]];
                    for (let u = 0; u < tempData.length; u++) {
                        weeks_tmp[week] = weeks_tmp[week].map(shift => {
                            if (shift.shift._id === shiftsLeft[k].shift._id) {
                                let split = shift.days[day].split("\n").filter(name => name != '');
                                split.push(tempData[u].name);
                                shift.days[day] = split.join('\n');
                                inShift.push(tempData[u].name);
                                data[week][day][shiftType] = data[week][day][shiftType].filter(user => user.name !== tempData[u].name);
                            }
                            return shift;
                        });
                    }
                }
                else {
                    let rndIndex = (0, functions_1.getRandomIndex)(data[week][day][shiftType].length);
                    weeks_tmp[week] = weeks_tmp[week].map(shift => {
                        if (shift.shift._id === shiftsLeft[k].shift._id) {
                            let split = shift.days[day].split("\n").filter(name => name != '');
                            split.push(data[week][day][shiftType][rndIndex].name);
                            shift.days[day] = split.join('\n');
                            inShift.push(data[week][day][shiftType][rndIndex].name);
                            data[week][day][shiftType] = data[week][day][shiftType].filter(user => user.name !== data[week][day][shiftType][rndIndex].name);
                        }
                        return shift;
                    });
                }
            }
        }
        return { data, inShift, weeks_tmp };
    }
    async excelToSchedule(files, scheduleId) {
        console.log(files[0]);
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
                    week_tmp.push({ shift: structureModel, days: ["", "", "", "", "", "", ""] });
                }
            }
            week_tmp.sort(this.sortStructures);
            weeks_tmp.push(week_tmp);
        }
        let managers = await this.userModel.find({ username: { $ne: "admin" }, role: 'SHIFT_MANAGER' });
        let settings = await this.settingsModel.findOne();
        let managers_names = managers.map(user => user.nickname);
        let extractedData = this.extractDataFromExcel(files[0], schedule.num_weeks);
        console.log("🚀 ~ file: schedule.service.ts ~ line 261 ~ ScheduleService ~ excelToSchedule ~ extractedData", extractedData[0][0]);
        for (let i = 0; i < extractedData.length; i++) {
            let morningShifts = weeks_tmp[i].filter(structure => structure.shift.shift === 0);
            let noonShifts = weeks_tmp[i].filter(structure => structure.shift.shift === 1);
            let nightShifts = weeks_tmp[i].filter(structure => structure.shift.shift === 2);
            for (let j = 0; j < extractedData[i].length; j++) {
                let inShift = [];
                let assigned = this.assignToShifts("morning", morningShifts, extractedData, inShift, j, i, managers_names, weeks_tmp, settings);
                extractedData = assigned.data;
                inShift = assigned.inShift;
                weeks_tmp = assigned.weeks_tmp;
                assigned = this.assignToShifts("noon", noonShifts, extractedData, inShift, j, i, managers_names, weeks_tmp, settings);
                extractedData = assigned.data;
                inShift = assigned.inShift;
                weeks_tmp = assigned.weeks_tmp;
                assigned = this.assignToShifts("night", nightShifts, extractedData, inShift, j, i, managers_names, weeks_tmp, settings);
                extractedData = assigned.data;
                inShift = assigned.inShift;
                weeks_tmp = assigned.weeks_tmp;
            }
        }
        console.log(extractedData[0]);
        schedule.weeks = weeks_tmp;
        await schedule.save();
        return {
            message: 'success'
        };
    }
    async scheduleTable(id) {
        let schedule = await this.scheduleModel.findById(id);
        if (!schedule) {
            throw new common_1.NotFoundException('סידור לא נמצא');
        }
        schedule = await this.populateSchedule(schedule);
        let counts = [];
        let total = { night: 0, weekend: 0 };
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
                    let shift_names = schedule.weeks[i][j].days[k].split('\n').filter(name => name !== '');
                    for (let l = 0; l < shift_names.length; l++) {
                        if (!names.includes(shift_names[l])) {
                            names.push(shift_names[l]);
                            counts.push(Object.assign({ name: shift_names[l], night: 0, weekend: 0 }, resetObj));
                        }
                        let index = names.indexOf(shift_names[l]);
                        switch (structure.shift) {
                            case 0:
                                if (k !== 6) {
                                    counts[index][`morning${i}`] = +counts[index][`morning${i}`] + 1;
                                    total[`morning${i}`] += 1;
                                }
                                else {
                                    counts[index].weekend += 1;
                                    total.weekend += 1;
                                }
                                break;
                            case 1:
                                if (k < 5) {
                                    counts[index][`noon${i}`] = +counts[index][`noon${i}`] + 1;
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
            let morningShifts = weeks[i].filter(shift => shift.shift.shift === 0);
            let noonShifts = weeks[i].filter(shift => shift.shift.shift === 1);
            let nightShifts = weeks[i].filter(shift => shift.shift.shift === 2);
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
                        morningShifts = weeks[i + 1].filter(shift => shift.shift.shift === 0);
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
            throw new common_1.NotFoundException('סידור לא נמצא');
        }
        let newSchedule = await this.scheduleModel.findByIdAndUpdate(schedule._id, schedule, { new: true });
        newSchedule = await this.populateSchedule(newSchedule);
        let days = this.calculateDays(newSchedule);
        return Object.assign(Object.assign({}, newSchedule), { days });
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
//# sourceMappingURL=schedule.service.js.map