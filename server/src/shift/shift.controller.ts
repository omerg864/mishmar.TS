import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { Shift } from './shift.model';
import { ShiftService } from './shift.service';

@Controller('shift')
export class ShiftController {

    constructor(private readonly shiftService: ShiftService) {}


    @Get('all')
    async getAll(): Promise<Shift[]> {
        return this.shiftService.getAll();
    }

    @Get(':id')
    async getShift(@Param('id') id: string): Promise<Shift> {
        return this.shiftService.getShift(id);
    }

    @Post()
    async addShift(@Body() shift: Shift): Promise<Shift> {
        return this.shiftService.create(shift);
    }

    @Delete(':id')
    async deleteShift(@Param('id') id: string): Promise<string> {
        return this.shiftService.delete(id);
    }

    @Patch()
    async patchShift(@Body() shift: Shift): Promise<Shift> {
        return this.shiftService.update(shift);
    }
}
