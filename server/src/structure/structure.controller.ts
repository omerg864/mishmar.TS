import type { Structure } from './structure.model';
import { Body, Controller, Delete, Get, NotFoundException, Param, Patch, Post } from '@nestjs/common';
import { StructureService } from './structure.service';

@Controller('api/structures')
export class StructureController {

    constructor(private readonly structureService: StructureService) {}

    @Post()
    async createStructure(@Body('structure') structure: Structure, @Body('scheduleAdd') scheduleAdd: boolean): Promise<Structure> {
        return this.structureService.createStructure(structure, scheduleAdd);
    }

    @Delete(':id')
    async deleteStructure(@Param('id') id: string): Promise<{id: string}> {
        return this.structureService.deleteStructure(id);
    }

    @Patch()
    async updateStructure(@Body() structure: Structure): Promise<Structure> {
        const updated = await this.structureService.updateStructure(structure);
        if (!updated) {
            throw new NotFoundException('Structure not found');
        }
        return updated;
    }

    @Patch('many')
    async updateManyStructures(@Body() structures: Structure[]): Promise<Structure[]> {
        return this.structureService.updateManyStructures(structures);
    }

    @Get('all')
    async getAll(): Promise<Structure[]>{
        return this.structureService.getAll();
    }

    @Get(':id')
    async getStructure(@Param('id') id: string): Promise<Structure> {
        const found = await this.structureService.getStructure(id);
        if (!found) {
            throw new NotFoundException('Structure not found');
        }
        return found;
    }
}
