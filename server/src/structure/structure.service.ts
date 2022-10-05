import { Structure } from './structure.model';
import { Injectable, NotFoundException } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class StructureService {
    constructor(@InjectModel('Structure') private readonly structureModel: Model<Structure>) {}

    async createStructure(structure: Structure) {
        return this.structureModel.create(structure);
    }

    async updateStructure(structure: Structure) {
        const structureFound = this.structureModel.findById(structure.id);
        if (!structureFound) {
            throw new NotFoundException('Structure not found');
        }
        return this.structureModel.findByIdAndUpdate(structure.id, structure, { new: true});
    }

    async deleteStructure(id: string) {
        const structure = await this.structureModel.findById(id);
        if (!structure) {
            throw new NotFoundException('Structure not found');
        }
        await structure.remove();
        return structure.id.toString();
    }

    async getAll() {
        return this.structureModel.find();
    }

    async getStructure(id: string) {
        return this.structureModel.findById(id);
    }

}
