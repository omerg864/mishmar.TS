import { Structure } from './structure.model';
import { Injectable, NotFoundException } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class StructureService {
    constructor(@InjectModel('Structure') private readonly structureModel: Model<Structure>) {}

    async createStructure(structure: Structure): Promise<Structure>{
        return this.structureModel.create(structure);
    }

    async updateManyStructures(structures: Structure[]): Promise<Structure[]> {
        let structures_temp: Structure[] = [];
        for (let i = 0; i < structures.length; i++) {
            structures_temp.push(await this.structureModel.findByIdAndUpdate(structures[i].id, structures[i], {new: true}));
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

    async deleteStructure(id: string): Promise<string> {
        const structure = await this.structureModel.findById(id);
        if (!structure) {
            throw new NotFoundException('Structure not found');
        }
        await structure.remove();
        return structure.id.toString();
    }

    async getAll(): Promise<Structure[]> {
        return this.structureModel.find();
    }

    async getStructure(id: string): Promise<Structure> {
        return this.structureModel.findById(id);
    }

}
