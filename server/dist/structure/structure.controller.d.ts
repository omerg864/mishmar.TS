import { Structure } from './structure.model';
import { StructureService } from './structure.service';
export declare class StructureController {
    private readonly structureService;
    constructor(structureService: StructureService);
    createStructure(strucure: Structure, scheduleAdd: boolean): Promise<Structure>;
    deleteStructure(id: string): Promise<{
        id: string;
    }>;
    updateStructure(structure: Structure): Promise<Structure>;
    updateManyStructures(structures: Structure[]): Promise<Structure[]>;
    getAll(): Promise<Structure[]>;
    getStructure(id: string): Promise<Structure>;
}
