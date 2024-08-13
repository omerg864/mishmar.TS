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
}
