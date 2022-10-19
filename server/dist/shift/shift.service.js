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
exports.ShiftService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let ShiftService = class ShiftService {
    constructor(shiftModel, userModel, scheduleModel, settingsModel) {
        this.shiftModel = shiftModel;
        this.userModel = userModel;
        this.scheduleModel = scheduleModel;
        this.settingsModel = settingsModel;
    }
    async getAll(query) {
        if (query) {
            return await this.shiftModel.find(query);
        }
        return await this.shiftModel.find();
    }
    async scheduleShifts(scheduleId) {
        const schedule = await this.scheduleModel.findById(scheduleId);
        if (!schedule) {
            throw new common_1.NotFoundException('משמרת לא נמצאה');
        }
        const shifts = await this.shiftModel.find({ scheduleId: scheduleId }).populate('userId');
        const params = ["morning", "noon", "night", "pull", "reinforcement", "notes"];
        let users = [];
        let weeks = [];
        let userMins = [];
        let counters;
        let userIn;
        let notesWeeks = [];
        let generalNotes = "";
        for (let i = 0; i < shifts.length; i++) {
            userIn = false;
            let nickname = shifts[i].userId.nickname;
            let id = shifts[i].userId._id.toString();
            if (shifts[i].notes !== "") {
                if (generalNotes === "") {
                    generalNotes = `${nickname}: ${shifts[i].notes}`;
                }
                else {
                    generalNotes += `\n${nickname}: ${shifts[i].notes}`;
                }
            }
            counters = { morning: [], noon: [] };
            for (let j = 0; j < shifts[i].weeks.length; j++) {
                notesWeeks.push("");
                weeks.push({
                    morning: ["", "", "", "", "", "", ""],
                    noon: ["", "", "", "", "", "", ""],
                    night: ["", "", "", "", "", "", ""],
                    pull: ["", "", "", "", "", "", ""],
                    reinforcement: ["", "", "", "", "", "", ""],
                    notes: ["", "", "", "", "", "", ""]
                });
                counters.morning[j] = 0;
                counters.noon[j] = 0;
                for (let h = 0; h < params.length; h++) {
                    for (let k = 0; k < shifts[i].weeks[j][params[h]].length; k++) {
                        if (users.filter(u => u.id === id).length === 0) {
                            users.push({ nickname, id });
                        }
                        if (shifts[i].weeks[j][params[h]][k]) {
                            if (params[h] !== 'pull') {
                                userIn = true;
                            }
                            let value = nickname;
                            if (params[h] === 'morning') {
                                if (!shifts[i].weeks[j].pull[k]) {
                                    value += " (לא משיכה) ";
                                }
                                if (k < 5) {
                                    counters.morning[j]++;
                                }
                            }
                            if (k < 5) {
                                if (params[h] === 'noon') {
                                    counters.noon[j]++;
                                }
                            }
                            if (params[h] === 'notes') {
                                if (notesWeeks[j] === "") {
                                    notesWeeks[j] = `יום ${k + 1} - ${nickname}: ${shifts[i].weeks[j][params[h]][k]}`;
                                }
                                else {
                                    notesWeeks[j] += `\nיום ${k + 1} - ${nickname}: ${shifts[i].weeks[j][params[h]][k]}`;
                                }
                            }
                            if (weeks[j][params[h]][k] === "") {
                                weeks[j][params[h]][k] = value;
                            }
                            else {
                                weeks[j][params[h]][k] += "\n" + value;
                            }
                        }
                    }
                }
            }
            if (userIn) {
                userMins.push({ nickname, id, morning: counters.morning, noon: counters.noon });
            }
        }
        let userids = userMins.map(user => user.id);
        userMins = userMins.filter(u => {
            for (let i = 0; i < u.morning.length; i++) {
                if (u.morning[i] < 2 || u.noon[i] < 1) {
                    return true;
                }
            }
            return false;
        });
        let noUsers = await this.userModel.find({ _id: { $nin: userids } }).select(["nickname", "id"]);
        noUsers = noUsers.map(user => { return Object.assign(Object.assign({}, user["_doc"]), { id: user._id.toString() }); });
        return { weeks, users, weeksNotes: notesWeeks, generalNotes, noUsers: noUsers, minUsers: userMins };
    }
    async createNewShift(userId, scheduleId) {
        let weeks = [];
        let schedule = await this.scheduleModel.findById(scheduleId);
        for (let i = 0; i < schedule.num_weeks; i++) {
            weeks.push({
                morning: [false, false, false, false, false, false, false],
                noon: [false, false, false, false, false, false, false],
                night: [false, false, false, false, false, false, false],
                pull: [true, true, true, true, true, true, true],
                reinforcement: [false, false, false, false, false, false, false],
                notes: ["", "", "", "", "", "", ""]
            });
        }
        let newShift = new this.shiftModel({ userId: userId, scheduleId: scheduleId, weeks });
        await newShift.save();
        return newShift;
    }
    async getUserScheduleShift(userId, scheduleId) {
        let shiftFound = await this.shiftModel.findOne({ userId: userId, scheduleId: scheduleId });
        if (!shiftFound) {
            return this.createNewShift(userId, scheduleId);
        }
        return shiftFound;
    }
    async update(shift, userId) {
        const shiftFound = await this.shiftModel.findById(shift._id);
        if (!shiftFound) {
            throw new common_1.NotFoundException('משמרת לא נמצאה');
        }
        const userFound = await this.userModel.findById(userId);
        if (!userFound.role.includes('ADMIN') && !userFound.role.includes('SITE_MANAGER')) {
            if (userId !== shift.userId.toString()) {
                throw new common_1.UnauthorizedException('לא יכול לשנות משמרת של משתמש אחר');
            }
            const settings = await this.settingsModel.findOne();
            if (!settings.submit) {
                throw new common_1.UnauthorizedException('אין אפשרות לשנות הגשות יותר');
            }
        }
        return await this.shiftModel.findByIdAndUpdate(shift._id, shift, { new: true });
    }
    async delete(id) {
        const shiftFound = await this.shiftModel.findById(id);
        if (!shiftFound) {
            throw new common_1.NotFoundException('משמרת לא נמצאה');
        }
        await this.shiftModel.findByIdAndRemove(id);
        return { id: shiftFound._id.toString() };
    }
};
ShiftService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)('Shift')),
    __param(1, (0, mongoose_1.InjectModel)('User')),
    __param(2, (0, mongoose_1.InjectModel)('Schedule')),
    __param(3, (0, mongoose_1.InjectModel)('Settings')),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model])
], ShiftService);
exports.ShiftService = ShiftService;
//# sourceMappingURL=shift.service.js.map