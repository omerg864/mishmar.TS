"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SettingsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const axios_1 = __importDefault(require("axios"));
const pizzip_1 = __importDefault(require("pizzip"));
const docxtemplater_1 = __importDefault(require("docxtemplater"));
let SettingsService = class SettingsService {
    constructor(settingsModel) {
        this.settingsModel = settingsModel;
    }
    async get() {
        const settings = await this.settingsModel.findOne();
        if (!settings) {
            const newSettings = new this.settingsModel();
            return await newSettings.save();
        }
        return settings;
    }
    async updateSettings(settings) {
        const settingsFound = await this.get();
        return await this.settingsModel.findOneAndUpdate({}, settings, { new: true });
    }
    async getGeneral() {
        const settingsFound = await this.get();
        return { title: settingsFound.title, submit: settingsFound.submit };
    }
    async getBFile(body) {
        const daysInMonth = this.getDaysInMonth(body.year, body.month);
        let url;
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
        const response = await (0, axios_1.default)({
            url,
            method: 'GET',
            responseType: 'arraybuffer'
        });
        const templateBuf = Buffer.from(response.data);
        const zip = new pizzip_1.default(templateBuf);
        const doc = new docxtemplater_1.default(zip, {
            paragraphLoop: true,
            linebreaks: true,
        });
        const days = {};
        for (let i = 1; i <= daysInMonth; i++) {
            days[`date${i}`] = `${i}/${body.month}/${body.year}`;
        }
        doc.render(Object.assign({}, days));
        const newBuffer = doc.getZip().generate({
            type: "nodebuffer",
            compression: "DEFLATE",
        });
        return new common_1.StreamableFile(newBuffer);
    }
    getDaysInMonth(year, month) {
        return new Date(year, month, 0).getDate();
    }
    async getHFile(body) {
        const daysInMonth = this.getDaysInMonth(body.year, body.month);
        let url;
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
        const response = await (0, axios_1.default)({
            url,
            method: 'GET',
            responseType: 'arraybuffer'
        });
        const templateBuf = Buffer.from(response.data);
        const zip = new pizzip_1.default(templateBuf);
        const doc = new docxtemplater_1.default(zip, {
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
            days[`date${i}`] = `${i}/${body.month}/${body.year}`;
            days[`day${i}`] = days_he[new Date(body.year, body.month - 1, i).toLocaleDateString('en-us', { weekday: 'long' })];
        }
        doc.render(Object.assign({}, days));
        const newBuffer = doc.getZip().generate({
            type: "nodebuffer",
            compression: "DEFLATE",
        });
        return new common_1.StreamableFile(newBuffer);
    }
};
SettingsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)('Settings')),
    __metadata("design:paramtypes", [mongoose_2.Model])
], SettingsService);
exports.SettingsService = SettingsService;
//# sourceMappingURL=settings.service.js.map