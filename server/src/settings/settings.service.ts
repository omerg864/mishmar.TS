import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Settings } from './settings.model';

@Injectable()
export class SettingsService {

    constructor(@InjectModel('Settings') private readonly settingsModel: Model<Settings>) {}


    async get(): Promise<Settings> {
        let settings = await this.settingsModel.findOne();
        if (!settings) {
            let newSettings = new this.settingsModel();
            return await newSettings.save();
        }
        return settings;
    }

    async updateSettings(settings: Settings): Promise<Settings> {
        const settingsFound = await this.get();
        return await this.settingsModel.findOneAndUpdate({}, settings, {new: true});
    }
}
