import { Structure } from './structure.model';
import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { StructureService } from './structure.service';

@Controller('api/structures')
export class StructureController {

    constructor(private readonly structureService: StructureService) {}

    @Post()
    async createStructure(@Body() strucure: Structure): Promise<Structure> {
        return this.structureService.createStructure(strucure);
    }

    @Delete(':id')
    async deleteStructure(@Param('id') id: string): Promise<{id: string}> {
        return this.structureService.deleteStructure(id);
    }

    @Patch()
    async updateStructure(@Body() structure: Structure): Promise<Structure> {
        return this.structureService.updateStructure(structure);
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
        return this.structureService.getStructure(id);
    }
}
