import { Settings } from './settings.model';
import { SettingsService } from './settings.service';
export declare class SettingsController {
    private readonly settingsService;
    constructor(settingsService: SettingsService);
    get(): Promise<Settings>;
    updateSettings(settings: Settings): Promise<Settings>;
}
