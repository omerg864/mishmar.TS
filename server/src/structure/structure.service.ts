import { Structure } from './structure.model';
import { Injectable, NotFoundException } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Schedule } from 'src/schedule/schedule.model';

@Injectable()
export class StructureService {
    constructor(@InjectModel('Structure') private readonly structureModel: Model<Structure>, @InjectModel('Schedule') private readonly scheduleModel: Model<Schedule>) {}

    async createStructure(structure: Structure, scheduleAdd: boolean): Promise<Structure>{
        let newStructure =  await this.structureModel.create(structure);
        if (scheduleAdd){
            let schedule = (await this.scheduleModel.find().sort({ date: -1}).limit(1))[0];
            let weeks = [...schedule.weeks];
            for (let i = 0; i < weeks.length; i++){ 
                weeks[i].push({ shift: newStructure._id.toString(), days: ["", "", "", "", "", "", ""]})
            }
            schedule.weeks = weeks;
            await schedule.save();
        }
        return newStructure;
    }

    async updateManyStructures(structures: Structure[]): Promise<Structure[]> {
        let structures_temp: Structure[] = [];
        for (let i = 0; i < structures.length; i++) {
            structures_temp.push(await this.structureModel.findByIdAndUpdate(structures[i]._id, structures[i], {new: true}));
        }
        return structures_temp;
    }

    async updateStructure(structure: Structure): Promise<Structure> {
        const structureFound = this.structureModel.findById(structure.id);
        if (!structureFound) {
            throw new NotFoundException('Structure not found');
        }
        return this.structureModel.findByIdAndUpdate(structure.id, structure, { new: true});
    }

    async deleteStructure(id: string): Promise<{id: string}> {
        const structure = await this.structureModel.findById(id);
        if (!structure) {
            throw new NotFoundException('Structure not found');
        }
        await structure.remove();
        return {id :structure._id.toString()};
    }

    async getAll(): Promise<Structure[]> {
        return this.structureModel.find().sort({ shift: 1, index: 1});
    }

    async getStructure(id: string): Promise<Structure> {
        return this.structureModel.findById(id);
    }

}
