import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Structure } from 'src/structure/structure.model';
import { Schedule } from './schedule.model';
import { Document } from 'mongoose';

type WeeksMap = Map<string, { shift: string|Structure, value: string}[]>

@Injectable()
export class ScheduleService {

    constructor(@InjectModel('Schedule') private readonly scheduleModel: Model<Schedule>, @InjectModel('Structure') private readonly structureModel: Model<Structure>) {}


    async populateSchedule(schedule: Schedule): Promise<Schedule> {
        let schedule_temp: Schedule = {...schedule["_doc"]}
        let weeks_tmp: WeeksMap[]|Object[] = [];
        for( let i = 0; i < schedule.weeks.length; i++ ) {
            let week_tmp: WeeksMap = new Map();
            for( let obj of (schedule.weeks[i] as WeeksMap).keys() ) {
                let week: {shift: Structure, value: string}[] =[]
                for ( let j = 0; j < (schedule.weeks[i] as WeeksMap).get(obj).length; j++ ) {
                    let model_obj = await this.structureModel.findById((schedule.weeks[i] as WeeksMap).get(obj)[j].shift);
                    week.push({shift: model_obj, value: (schedule.weeks[i] as WeeksMap).get(obj)[j].value});
                }
                week_tmp.set(obj.toString(), week);
            }
            weeks_tmp.push(Object.assign({}, ...Array.from(week_tmp.entries()).map(([k, v]) =>({[k]: v}) )));
        }
        schedule_temp.weeks = weeks_tmp;
        return schedule_temp;
    }


    async getAll(): Promise<Schedule[]> {
        let schedules =  await this.scheduleModel.find().sort( { date: -1});
        let schedules_temp: Schedule[] = [];
        for (let j = 0; j < schedules.length; j++) {
            let schedule_temp: Schedule = await this.populateSchedule(schedules[j]);
            schedules_temp.push(schedule_temp);
        }
        return schedules_temp;
    }

    addDays = (date: Date, days: number): Date => {
        var result = new Date(date);
        result.setDate(result.getDate() + days);
        return result;
    }

    calculateDays(schedule: Schedule): Date[][] {
        let days_tmp: Date[][] = [];
        let firstDate =  new Date(schedule.date);
        for(let j = 0; j < schedule.num_weeks; j++) {
            days_tmp[j] = [];
            for (let i = j * 7; i < (j + 1) * 7 ; i++) {
                days_tmp[j].push(this.addDays(firstDate, i));
            }
        }
        return days_tmp;
    }

    async getSchedule(id: string): Promise<Schedule> {
        let schedule: Schedule = await this.scheduleModel.findById(id);
        if (!schedule) {
            throw new NotFoundException('Schedule not found');
        }
        schedule = await this.populateSchedule(schedule);
        console.log(schedule);
        let days: Date[][] = this.calculateDays(schedule);
        return {...schedule, days };
    }

    async create(schedule: Schedule): Promise<Schedule> {
        const rows = await this.structureModel.find().sort({ shift: 1, index: 1});
        let weeks: WeeksMap[] = [];
        for (let i = 0; i < schedule.num_weeks; i++) {
            weeks[i] = new Map();
            let week: {shift: string, value: string}[] = []
            for (let j = 0; j < rows.length; j++) {
                week.push({shift: rows[j]._id.toString(), value: ''});
            }
            for (let k = 0; k < 7; k++) {
                weeks[i].set(k.toString(), week);
            }
        }
        return await this.scheduleModel.create({...schedule, weeks});
    }

    async update(schedule: Schedule): Promise<Schedule> {
        let scheduleFound = await this.scheduleModel.findById(schedule.id);
        if (!scheduleFound) {
            throw new NotFoundException('Schedule not found');
        }
        let newSchedule: Schedule = await this.scheduleModel.findByIdAndUpdate(schedule.id, schedule, {new: true});
        newSchedule = await this.populateSchedule(newSchedule);
        let days: Date[][] = this.calculateDays(newSchedule);
        return {...newSchedule, days};
        
    }

    async delete(id: string): Promise<string> {
        const schedule = await this.scheduleModel.findById(id);
        if (!schedule) {
            throw new NotFoundException('Schedule not found');
        }
        await schedule.remove();
        return schedule._id.toString();
    }
}
