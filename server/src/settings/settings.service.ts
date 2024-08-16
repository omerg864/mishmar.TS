import { Injectable, StreamableFile } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Settings } from './settings.model';
import axios from 'axios';
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';

@Injectable()
export class SettingsService {

    constructor(@InjectModel('Settings') private readonly settingsModel: Model<Settings>) {}


    async get(): Promise<Settings> {
        const settings = await this.settingsModel.findOne();
        if (!settings) {
            const newSettings = new this.settingsModel();
            return await newSettings.save();
        }
        return settings;
    }

    async updateSettings(settings: Settings): Promise<Settings> {
        const settingsFound = await this.get();
        return await this.settingsModel.findOneAndUpdate({}, settings, {new: true});
    }

    async getGeneral(): Promise<{title: string, submit: boolean}> {
        const settingsFound = await this.get();
        return { title: settingsFound.title, submit: settingsFound.submit}
    }

    async getBFile(body: {month: number, year: number}): Promise<StreamableFile> {
        const daysInMonth = this.getDaysInMonth(body.year, body.month);
        let url: string;
        switch (daysInMonth) {
            case 28:
                url = process.env.B_FILE_28;
                break;
            case 29:
                url = process.env.B_FILE_29;
                break;
            case 30:
                url = process.env.B_FILE_30;
                break;
            default:
                url = process.env.B_FILE_31;
                break;
        }
        const response = await axios({
            url,
            method: 'GET',
            responseType: 'arraybuffer' // Ensure the response is an array buffer
        });

        const templateBuf = Buffer.from(response.data);

        const zip = new PizZip(templateBuf);

        // This will parse the template, and will throw an error if the template is invalid
        const doc = new Docxtemplater(zip, {
            paragraphLoop: true,
            linebreaks: true,
        });

        const days = {};

        for (let i = 1; i <= daysInMonth; i++) {
            days[`date${i}`] = `${i}/${body.month}/${body.year}`; // Get the date in the format of dd/mm/yyyy
        }
        doc.render({
            ...days,
        });

        const newBuffer = doc.getZip().generate({
            type: "nodebuffer",
            compression: "DEFLATE",
        });

        return new StreamableFile(newBuffer);

    }

    getDaysInMonth(year: number, month: number) {
        return new Date(year, month, 0).getDate();
    }

    async getHFile(body: {month: number, year: number}): Promise<StreamableFile> {
        const daysInMonth = this.getDaysInMonth(body.year, body.month);
        let url: string;
        switch (daysInMonth) {
            case 28:
                url = process.env.H_FILE_28;
                break;
            case 29:
                url = process.env.H_FILE_29;
                break;
            case 30:
                url = process.env.H_FILE_30;
                break;
            default:
                url = process.env.H_FILE_31;
                break;
        }
        const response = await axios({
            url,
            method: 'GET',
            responseType: 'arraybuffer' // Ensure the response is an array buffer
        });
        // The response data is already a buffer
        const templateBuf = Buffer.from(response.data);

        const zip = new PizZip(templateBuf);

        // This will parse the template, and will throw an error if the template is invalid
        const doc = new Docxtemplater(zip, {
            paragraphLoop: true,
            linebreaks: true,
        });

        const days = {};
        const days_he = {
            Sunday: "ראשון",
            Monday: "שני",
            Tuesday: "שלישי",
            Wednesday: "רביעי",
            Thursday: "חמישי",
            Friday: "שישי",
            Saturday: "שבת",
        };
        for (let i = 1; i <= daysInMonth; i++) {
            days[`date${i}`] = `${i}/${body.month}/${body.year}`; // Get the date in the format of dd/mm/yyyy
            // Get the day name in Hebrew
            days[`day${i}`] = days_he[new Date(body.year, body.month - 1, i).toLocaleDateString('en-us', { weekday: 'long' })];
        }
        doc.render({
            ...days,
        });

        const newBuffer = doc.getZip().generate({
            type: "nodebuffer",
            compression: "DEFLATE",
        });

        return new StreamableFile(newBuffer);
    }
}
