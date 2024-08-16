import { Body, Controller, Get, Patch, Post, StreamableFile } from '@nestjs/common';
import { Settings } from './settings.model';
import { SettingsService } from './settings.service';

@Controller('api/settings')
export class SettingsController {

    constructor(private readonly settingsService: SettingsService) {}


    @Get()
    async get(): Promise<Settings>{
        return this.settingsService.get();
    }

    @Patch()
    async updateSettings(@Body() settings: Settings): Promise<Settings> {
        return this.settingsService.updateSettings(settings);
    }

    @Get('general')
    async getGeneral(): Promise<{title: string, submit: boolean}>{
        return this.settingsService.getGeneral();
    }

    @Post('hfile')
    async getHFile(
        @Body() body: {month: number, year: number}
    ): Promise<StreamableFile> {
        return this.settingsService.getHFile(body);
    }
    @Post('bfile')
    async getBFile(
        @Body() body: {month: number, year: number}
    ): Promise<StreamableFile> {
        return this.settingsService.getBFile(body);
    }
}
