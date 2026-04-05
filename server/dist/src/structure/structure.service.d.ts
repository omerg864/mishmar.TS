import { Structure } from './structure.model';
import { Model } from 'mongoose';
import { Schedule } from '../schedule/schedule.model';
export declare class StructureService {
    private readonly structureModel;
    private readonly scheduleModel;
    constructor(structureModel: Model<Structure>, scheduleModel: Model<Schedule>);
    createStructure(structure: Structure, scheduleAdd: boolean): Promise<Structure>;
    updateManyStructures(structures: Structure[]): Promise<Structure[]>;
    updateStructure(structure: Structure): Promise<Structure>;
    deleteStructure(id: string): Promise<{
        id: string;
    }>;
    getAll(): Promise<Structure[]>;
    getStructure(id: string): Promise<Structure>;
}
