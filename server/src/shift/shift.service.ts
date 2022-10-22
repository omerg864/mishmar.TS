import { Settings } from '../settings/settings.model';
import { Injectable, NotFoundException, UnauthorizedException, StreamableFile, Delete } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Schedule } from '../schedule/schedule.model';
import { User } from '../user/user.model';
import { Shift, ShiftScheduleWeek } from './shift.model';
import * as excel from 'excel4node';
import * as fs from 'fs';
import { join } from 'path';
import { dateToStringShort } from '../functions/functions';
import { EventInterface } from '../event/event.model';


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
        let userids = userMins.map(user => user.id);
        users = users.filter(user => userids.includes(user.id));
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

    async toExcel(weeks: ShiftScheduleWeek[], days: string[][], num_users: number, weeksNotes: string[], generalNotes: string, events: EventInterface[]): Promise<StreamableFile> {
        const workbook = new excel.Workbook();
        const worksheetOptions ={
            sheetView: {
                rightToLeft: true,
            },
        }
        const border = {
            border: {
                left: {
                    style: 'thin', 
                    color: '#000000' 
                },
                right: {
                    style: 'thin', 
                    color: '#000000'
                },
                top: {
                    style: 'thin', 
                    color: '#000000'
                },
                bottom: {
                    style: 'thin', 
                    color: '#000000'
                },
            }
        }
        const ws = workbook.addWorksheet('Schedule', worksheetOptions);
        const headerStyle = {
            alignment: {
                horizontal: 'center',
                vertical: 'center',
            },
            fill: {
                type: 'pattern',
                fgColor: '#FFFFFF'
            },
            ...border
          };
        const cellStyle = {
            alignment: {
                horizontal: 'center',
                vertical: 'center',
            },
        }
        const topBorder = {
            border: {
                top: {
                    style: 'thick', 
                    color: '#000000'
                }
            }
        }
        const leftBorder = {
            border: {
                left: {
                    style: 'thick', 
                    color: '#000000'
                }
            }
        }
        ws.cell(1, 1, 2, weeks.length * 7 + 2, true).string('הגשות')
        .style(workbook.createStyle({...headerStyle, font: {size: 24, bold: true}}));
        ws.cell(1, weeks.length * 7 + 3, 2, weeks.length * 7 + 10, true)
        .string(`${dateToStringShort(new Date(days[0][0]))} - ${dateToStringShort(new Date(days.slice(-1)[0].slice(-1)[0]))}`)
        .style(workbook.createStyle({...headerStyle, font: {size: 24, bold: true}}));
        const days_names = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];
        ws.cell(3, 1).string('תאריך').style(workbook.createStyle(headerStyle))
        ws.cell(4, 1).string('יום').style(workbook.createStyle(headerStyle))
        ws.cell(5, 1, num_users + 8, 1, true).string('בוקר').style(headerStyle)
        ws.cell(num_users + 9, 1, num_users * 2 + 12, 1, true).string('צהריים').style(headerStyle)
        ws.cell(num_users + 9, 2, num_users + 9, weeks.length * 7 + 1, false)
        .string('').style({...cellStyle, ...topBorder})
        ws.cell(num_users * 2 + 13, 2, num_users * 2 + 13, weeks.length * 7 + 1, false)
        .string('').style({...cellStyle, ...topBorder})
        ws.cell(num_users * 2 + 13, 1, num_users * 3 + 16, 1, true).string('לילה').style(headerStyle);
        let names: Set<string> = new Set();
        for (let i = 0; i < weeks.length; i++) {
            ws.cell(5, (i + 1) * 8, num_users * 3 + 16, (i + 1) * 8, false)
            .string('').style({...cellStyle, ...leftBorder})
            for ( let j = 0; j < 7; j++) {
                ws.cell(3, 2 + j + (i * 7)).string(dateToStringShort(new Date(days[i][j])))
                .style(workbook.createStyle(headerStyle))
                ws.cell(4, 2 + j + (i * 7)).string(days_names[j]).style(workbook.createStyle(headerStyle))
                const monrningNames = weeks[i].morning[j].split('\n').filter(item => item != '');
                for (let k = 0; k < monrningNames.length; k++) {
                    if (!monrningNames[k].includes(' (לא משיכה) ')) {
                        names.add(monrningNames[k]);
                        ws.cell(5 + k, 2 + j + (i * 7))
                        .string(monrningNames[k]).style(workbook.createStyle(cellStyle))
                    }
                    else {
                        names.add(monrningNames[k].replace(' (לא משיכה) ', ''));
                        ws.cell(5 + k, 2 + j + (i * 7)).string(monrningNames[k].replace(' (לא משיכה) ', '')).style(workbook.createStyle({...cellStyle, font: {color: '#ff0000'}}))
                    }                
                }
                const noonNames = weeks[i].noon[j].split('\n').filter(item => item != '');
                for (let k = 0; k < noonNames.length; k++) {
                    names.add(noonNames[k]);
                    ws.cell(num_users + 9 + k, 2 + j + (i * 7))
                    .string(noonNames[k]).style(workbook.createStyle(cellStyle))
                }
                const nightNames = weeks[i].night[j].split('\n').filter(item => item != '');
                for (let k = 0; k < nightNames.length; k++) {
                    names.add(nightNames[k]);
                    ws.cell(num_users * 2 + 13 + k, 2 + j + (i * 7))
                    .string(nightNames[k]).style(workbook.createStyle(cellStyle))
                }
            }
            ws.cell(4, weeks.length * 7 + 5 + (i * 2)).string(`בוקר ${i + 1}`)
            .style(workbook.createStyle(headerStyle))
            ws.cell(4, weeks.length * 7 + 6 + (i * 2)).string(`צהריים ${i + 1}`)
            .style(workbook.createStyle(headerStyle))
        }
        let shiftsWeeksEnd = weeks.length * 7 + 6 + ((weeks.length - 1) * 2);
        ws.cell(4, weeks.length * 7 + 3, 4, weeks.length * 7 + 4, true).string('שם')
        .style(workbook.createStyle(headerStyle))
        ws.cell(4, shiftsWeeksEnd + 1).string(`לילה`).style(workbook.createStyle(headerStyle));
        ws.cell(4, shiftsWeeksEnd + 2).string(`סופ״ש`).style(workbook.createStyle(headerStyle));
        names.add('');
        let namesArray = Array.from(names) // excel.getExcelAlpha(10);
        for (let i = 0; i < namesArray.length; i++) {
            ws.cell(5 + i, weeks.length * 7 + 3, 5 + i, weeks.length * 7 + 4, true)
            .string(namesArray[i]).style(workbook.createStyle(headerStyle));
            ws.cell(5 + i, weeks.length * 7 + 5, 5 + i, shiftsWeeksEnd + 2, false)
            .style(workbook.createStyle(headerStyle));
        }
        ws.cell(5 + namesArray.length, weeks.length * 7 + 3, 5 + namesArray.length, weeks.length * 7 + 4, true).string('סה״כ').style(workbook.createStyle(headerStyle));
        for (let i = 0; i < weeks.length; i++) {
            ws.cell(5 + namesArray.length, weeks.length * 7 + 5 + (i * 2))
            .formula(`=SUM(${excel.getExcelAlpha(weeks.length * 7 + 5 + (i * 2))}5:${excel.getExcelAlpha(weeks.length * 7 + 5 + (i * 2))}${4 + namesArray.length})`)
            .style(workbook.createStyle(headerStyle))
            ws.cell(5 + namesArray.length, weeks.length * 7 + 6 + (i * 2))
            .formula(`=SUM(${excel.getExcelAlpha(weeks.length * 7 + 6 + (i * 2))}5:${excel.getExcelAlpha(weeks.length * 7 + 6 + (i * 2))}${4 + namesArray.length})`)
            .style(workbook.createStyle(headerStyle))
        }
        ws.cell(5 + namesArray.length, shiftsWeeksEnd + 1)
        .formula(`=SUM(${excel.getExcelAlpha(shiftsWeeksEnd + 1)}5:${excel.getExcelAlpha(shiftsWeeksEnd + 1)}${4 + namesArray.length})`)
        .style(workbook.createStyle(headerStyle))
        ws.cell(5 + namesArray.length, shiftsWeeksEnd + 2)
        .formula(`=SUM(${excel.getExcelAlpha(shiftsWeeksEnd + 2)}5:${excel.getExcelAlpha(shiftsWeeksEnd + 2)}${4 + namesArray.length})`)
        .style(workbook.createStyle(headerStyle))
        let notes_start = 8 + namesArray.length;
        ws.cell(notes_start, weeks.length * 7 + 3, notes_start + 1, weeks.length * 7 + 10, true)
        .string(`הערות`).style(workbook.createStyle({...headerStyle, font: {size: 24}}));
        let notes_array = generalNotes.split('\n')
        for(let i = 0; i < notes_array.length; i++) {
            ws.cell(notes_start + 2 + i, weeks.length * 7 + 3, notes_start + 2 + i, weeks.length * 7 + 10, true)
            .string(notes_array[i]).style(workbook.createStyle(headerStyle));
        }
        notes_start += 2 + notes_array.length;
        for (let i = 0; i < weeksNotes.length; i++) {
            let week_notes = weeksNotes[i].split('\n');
            ws.cell(notes_start, weeks.length * 7 + 3, notes_start + 1, weeks.length * 7 + 10, true)
            .string(`הערות שבוע ${i + 1}`).style(workbook.createStyle({...headerStyle, font: {size: 24}}));
            notes_start += 2;
            for (let j = 0; j < week_notes.length; j++) {
                ws.cell(notes_start + j, weeks.length * 7 + 3, notes_start + j, weeks.length * 7 + 10, true)
                .string(week_notes[j]).style(workbook.createStyle(headerStyle))
            }
            notes_start += week_notes.length;
        }
        notes_start += 2;
        ws.cell(notes_start, weeks.length * 7 + 3, notes_start + 1, weeks.length * 7 + 10, true)
            .string(`אירועים`).style(workbook.createStyle({...headerStyle, font: {size: 24}}));
        notes_start += 2;
        for(let i = 0; i < events.length; i++) {
            let value = `${dateToStringShort(new Date(events[i].date))}: ${events[i].content} - `
            for(let j = 0; j < events[i].users.length; j++) {
                value += ` ${(events[i].users[j] as User).nickname}`;
                if (j !== events[i].users.length - 1)
                    value += `,`;
            }
            ws.cell(notes_start + i, weeks.length * 7 + 3, notes_start + i, weeks.length * 7 + 10, true)
            .string(value).style(workbook.createStyle(headerStyle))
        }
        const buffer: Buffer = await workbook.writeToBuffer();
        return new StreamableFile(buffer)
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
