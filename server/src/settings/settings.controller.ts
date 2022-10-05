import { Body, Controller, Get, Patch } from '@nestjs/common';
import { Settings } from './settings.model';
import { SettingsService } from './settings.service';

@Controller('settings')
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
}
