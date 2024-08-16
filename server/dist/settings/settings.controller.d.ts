import { StreamableFile } from '@nestjs/common';
import { Settings } from './settings.model';
import { SettingsService } from './settings.service';
export declare class SettingsController {
    private readonly settingsService;
    constructor(settingsService: SettingsService);
    get(): Promise<Settings>;
    updateSettings(settings: Settings): Promise<Settings>;
    getGeneral(): Promise<{
        title: string;
        submit: boolean;
    }>;
    getHFile(body: {
        month: number;
        year: number;
    }): Promise<StreamableFile>;
    getBFile(body: {
        month: number;
        year: number;
    }): Promise<StreamableFile>;
}
