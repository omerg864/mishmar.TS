import { StreamableFile } from '@nestjs/common';
import { Model } from 'mongoose';
import { Settings } from './settings.model';
export declare class SettingsService {
    private readonly settingsModel;
    constructor(settingsModel: Model<Settings>);
    get(): Promise<Settings>;
    updateSettings(settings: Settings): Promise<Settings>;
    getGeneral(): Promise<{
        title: string;
        submit: boolean;
    }>;
    getBFile(body: {
        month: number;
        year: number;
    }): Promise<StreamableFile>;
    getDaysInMonth(year: number, month: number): number;
    getHFile(body: {
        month: number;
        year: number;
    }): Promise<StreamableFile>;
}
