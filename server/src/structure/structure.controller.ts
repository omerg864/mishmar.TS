import { Structure } from './structure.model';
import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { StructureService } from './structure.service';

@Controller('structure')
export class StructureController {

    constructor(private readonly structureService: StructureService) {}

    @Post()
    async createStructure(@Body() strucure: Structure) {
        return this.structureService.createStructure(strucure);
    }

    @Delete(':id')
    async deleteStructure(@Param('id') id: string) {
        return this.structureService.deleteStructure(id);
    }

    @Patch()
    async updateStructure(@Body() structure: Structure) {
        return this.structureService.updateStructure(structure);
    }

    @Get('all')
    async getAll(){
        return this.structureService.getAll();
    }

    @Get(':id')
    async getStructure(@Param('id') id: string) {
        return this.structureService.getStructure(id);
    }
}
