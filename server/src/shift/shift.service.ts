import { Settings } from '../settings/settings.model';
import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Schedule } from '../schedule/schedule.model';
import { User } from '../user/user.model';
import { Shift, ShiftScheduleWeek } from './shift.model';


@Injectable()
export class ShiftService {

    constructor(@InjectModel('Shift') private readonly shiftModel: Model<Shift>,
     @InjectModel('User') private readonly userModel: Model<User>,
      @InjectModel('Schedule') private readonly scheduleModel: Model<Schedule>,
      @InjectModel('Settings') private readonly settingsModel: Model<Settings>) {}


    async getAll(query: {userId: string, scheduleId: string}): Promise<Shift[]> {
        if (query) {
            return await this.shiftModel.find(query);
        }
        return await this.shiftModel.find();
    }

    async scheduleShifts(scheduleId: string): Promise<{weeks: ShiftScheduleWeek[],weeksNotes: string[], generalNotes: string,  users: {nickname: string, id: string }[], noUsers: {nickname: string, id: string }[], minUsers: {nickname: string, id: string, morning: number[], noon: number[]  }[]}> {
        const schedule = await this.scheduleModel.findById(scheduleId);
        if (!schedule) {
            throw new NotFoundException('משמרת לא נמצאה');
        }
        const shifts = await this.shiftModel.find({ scheduleId: scheduleId }).populate('userId');
        const params = ["morning", "noon", "night", "pull", "reinforcement", "notes"];
        let users: {nickname: string, id: string}[] = [];
        let weeks: ShiftScheduleWeek[] = [];
        let userMins: {id: string, nickname: string, morning: number[], noon: number[]}[] = [];
        let counters: {morning: number[], noon: number[]};
        let userIn: boolean;
        let notesWeeks: string[] = [];
        let generalNotes: string = "";
        for (let i = 0; i < shifts.length; i++) {
            userIn = false;
            let nickname = (shifts[i].userId as User).nickname;
            let id = (shifts[i].userId as User)._id.toString();
            if (shifts[i].notes !== "") {
                if (generalNotes === "") {
                    generalNotes = `${nickname}: ${shifts[i].notes}`;
                } else {
                    generalNotes += `\n${nickname}: ${shifts[i].notes}`;
                }
            }
            counters = {morning: [], noon: []};
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
                for( let h = 0; h < params.length; h++ ) {
                    for ( let k = 0; k < shifts[i].weeks[j][params[h]].length; k++ ) {
                        if (users.filter(u => u.id === id).length === 0) {
                            users.push({ nickname, id});
                        }
                        if (shifts[i].weeks[j][params[h]][k]) {
                            if (params[h] !== 'pull') {
                                userIn = true;
                            }
                            let value = nickname
                            if (params[h] === 'morning') {
                                if (!shifts[i].weeks[j].pull[k]) {
                                    value += " (לא משיכה) ";
                                }
                                if (k < 5){
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
                                } else {
                                    notesWeeks[j] += `\nיום ${k + 1} - ${nickname}: ${shifts[i].weeks[j][params[h]][k]}`;
                                }
                            }
                            if (weeks[j][params[h]][k] === "") {
                                weeks[j][params[h]][k] = value;
                            } else {
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
        let userids = users.map(user => user.id);
        userMins = userMins.filter(u => {
            for (let i = 0; i < u.morning.length; i++) {
                if (u.morning[i] < 2 || u.noon[i] < 1) {
                    return true;
                }
            }
            return false;
        })
        let noUsers = await this.userModel.find({ _id: {$nin: userids}}).select(["nickname", "id"]);
        noUsers = noUsers.map(user => {return {...user["_doc"], id: user._id.toString()}});
        return {weeks, users, weeksNotes: notesWeeks, generalNotes , noUsers: (noUsers as {nickname: string, id: string }[]), minUsers: userMins};
    }

    async createNewShift(userId: string, scheduleId: string): Promise<Shift> {
        let weeks: {morning: boolean[], noon: boolean[], night: boolean[], pull: boolean[], reinforcement: boolean[], notes: string[]}[] = [];
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
            let newShift = new this.shiftModel({ userId: userId, scheduleId: scheduleId, weeks});
            await newShift.save();
            return newShift;
    }

    async getUserScheduleShift(userId: string, scheduleId: string): Promise<Shift> {
        let shiftFound = await this.shiftModel.findOne( { userId: userId, scheduleId: scheduleId});
        if (!shiftFound) {
            return this.createNewShift(userId, scheduleId);
        }
        return shiftFound;
    }

    async update(shift: Shift, userId: string): Promise<Shift> {
        const shiftFound = await this.shiftModel.findById(shift._id);
        if (!shiftFound) {
            throw new NotFoundException('משמרת לא נמצאה');
        }
        const userFound = await this.userModel.findById(userId);
        if (!userFound.role.includes('ADMIN') && !userFound.role.includes('SITE_MANAGER')) {
            if (userId !== shift.userId.toString()) {
                throw new UnauthorizedException('לא יכול לשנות משמרת של משתמש אחר');
            }
            const settings = await this.settingsModel.findOne();
            if (!settings.submit) {
                throw new UnauthorizedException('אין אפשרות לשנות הגשות יותר');
            }
        }
        return await this.shiftModel.findByIdAndUpdate(shift._id, shift, { new: true });
    }

    async delete(id: string): Promise<{id: string}> {
        const shiftFound = await this.shiftModel.findById(id);
        if (!shiftFound) {
            throw new NotFoundException('משמרת לא נמצאה');
        }
        await this.shiftModel.findByIdAndRemove(id);
        return {id: shiftFound._id.toString()};
    }

}
