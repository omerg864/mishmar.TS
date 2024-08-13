"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
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
exports.UserService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const jwt = __importStar(require("jsonwebtoken"));
const bcrypt = __importStar(require("bcryptjs"));
const functions_1 = require("../functions/functions");
const crypto = __importStar(require("crypto"));
const regularExpressions_1 = require("../types/regularExpressions");
const functions_2 = require("../functions/functions");
const axios_1 = __importDefault(require("axios"));
const pdfreader_1 = require("pdfreader");
let UserService = class UserService {
    constructor(userModel, settingsModel) {
        this.userModel = userModel;
        this.settingsModel = settingsModel;
        this.readPdf = (buffer) => {
            const lines = [];
            return new Promise((resolve, reject) => {
                new pdfreader_1.PdfReader().parseBuffer(buffer, (err, item) => {
                    if (err) {
                        console.error("error:", err);
                        reject(err);
                    }
                    else if (!item) {
                        console.warn("end of buffer");
                        const sortedLines = Object.keys(lines)
                            .sort((a, b) => parseFloat(a) - parseFloat(b))
                            .map((y) => lines[y].join(''));
                        resolve(sortedLines);
                    }
                    else if (item.text !== undefined) {
                        const y = item.y;
                        if (!lines[y]) {
                            lines[y] = [];
                        }
                        lines[y].push(item.text);
                    }
                });
            });
        };
    }
    generateToken(id) {
        return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
    }
    async login(username, password) {
        const user = await this.userModel
            .findOne({ username })
            .select('-reset_token');
        if (!user) {
            throw new common_1.NotFoundException('משתמש לא נמצא');
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            throw new common_1.UnauthorizedException('סיסמא לא נכונה');
        }
        const token = this.generateToken(user.id);
        delete user['_doc'].password;
        return { user: Object.assign({}, user['_doc']), token };
    }
    async google(code) {
        if (!code) {
            throw new common_1.UnauthorizedException('Invalid code');
        }
        const googleRes = await functions_2.googleAuthClient.getToken(code);
        functions_2.googleAuthClient.setCredentials(googleRes.tokens);
        const userRes = await axios_1.default.get(`https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${googleRes.tokens.access_token}`);
        if (!userRes.data.email) {
            throw new common_1.UnauthorizedException('Invalid email');
        }
        const user = await this.userModel.findOne({
            email: { $regex: new RegExp(`^${userRes.data.email}$`, 'i') },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const token = this.generateToken(user.id);
        delete user['_doc'].password;
        return { user: Object.assign({}, user['_doc']), token };
    }
    async register(user, pin_code) {
        if (user.username.includes('$')) {
            throw new common_1.ConflictException('שם משתמש לא יכול להכיל $');
        }
        let userFound = await this.userModel.findOne({
            username: { $regex: new RegExp(user.username, 'i') },
        });
        if (userFound) {
            throw new common_1.ConflictException('שם משתמש בשימוש');
        }
        if (!user.email || !regularExpressions_1.email_regex.test(user.email)) {
            throw new common_1.ConflictException('אימייל לא תקין');
        }
        userFound = await this.userModel.findOne({
            email: { $regex: new RegExp(user.email, 'i') },
        });
        if (userFound) {
            throw new common_1.ConflictException('אימייל בשימוש');
        }
        let settings = await this.settingsModel.findOne();
        if (!settings) {
            settings = new this.settingsModel();
            await settings.save();
        }
        if (settings.pin_code !== pin_code) {
            throw new common_1.UnauthorizedException('קוד הרשמה לא תקין');
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(user.password, salt);
        const newUser = await this.userModel.create(Object.assign(Object.assign({}, user), { password: hashedPassword }));
        return {
            message: 'Success',
        };
    }
    async updateManyUsers(users) {
        const users_temp = [];
        for (let i = 0; i < users.length; i++) {
            const userObj = Object.assign({}, users[i]);
            if (userObj.password) {
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(userObj.password, salt);
                userObj.password = hashedPassword;
            }
            const updatedUser = await this.userModel
                .findByIdAndUpdate(userObj._id, userObj, { new: true })
                .select(['-password', '-reset_token']);
            users_temp.push(updatedUser);
        }
        return users_temp;
    }
    async forgotPasswordEmail(email) {
        if (!email || !regularExpressions_1.email_regex.test(email)) {
            throw new common_1.ConflictException('אימייל לא תקין');
        }
        const userFound = await this.userModel.findOne({
            email: { $regex: new RegExp(email, 'i') },
        });
        if (!userFound) {
            throw new common_1.NotFoundException(`משתמש עם אימייל ${email} לא נמצא`);
        }
        let generatedToken = crypto.randomBytes(26).toString('hex');
        while (await this.userModel.findOne({ reset_token: generatedToken })) {
            generatedToken = crypto.randomBytes(26).toString('hex');
        }
        userFound.reset_token = generatedToken;
        await userFound.save();
        return (0, functions_1.sendMail)(email, 'איפוס סיסמה למשתמש', `כדי לאפס סיסמה נא ללכת לכתובת:\n ${process.env.SITE_ADDRESS}/password/reset/${generatedToken}`);
    }
    async resetTokenPassword(reset_token, password) {
        const userFound = await this.userModel.findOne({ reset_token });
        if (!userFound) {
            throw new common_1.NotFoundException(`טוקן איפוס לא תקין`);
        }
        if (password) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            userFound.password = hashedPassword;
            let generatedToken = crypto.randomBytes(26).toString('hex');
            while (await this.userModel.findOne({ reset_token: generatedToken })) {
                generatedToken = crypto.randomBytes(26).toString('hex');
            }
            userFound.reset_token = generatedToken;
            await userFound.save();
            return {
                success: true,
            };
        }
        else {
            throw new common_1.ConflictException('לא הוזנה סיסמה');
        }
    }
    async resetTokenCheck(reset_token) {
        const userFound = await this.userModel.findOne({ reset_token });
        if (!userFound) {
            throw new common_1.NotFoundException(`טוקן איפוס לא תקין`);
        }
        return {
            success: true,
        };
    }
    async updateUser(user, userId) {
        const userObj = Object.assign({}, user);
        if (userObj.role) {
            delete userObj.role;
        }
        if (userObj._id) {
            delete userObj._id;
        }
        if (user.password) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(user.password, salt);
            userObj['password'] = hashedPassword;
        }
        const updatedUser = await this.userModel
            .findByIdAndUpdate(userId, userObj, { new: true })
            .select(['-password', '-reset_token']);
        return updatedUser;
    }
    async deleteUser(userId) {
        const user = await this.userModel.findById(userId);
        if (!user) {
            throw new common_1.NotFoundException('משתמש לא נמצא');
        }
        await user.delete();
        return { id: user.id.toString() };
    }
    async getAll() {
        const users = await this.userModel
            .find({ username: { $ne: 'admin' } })
            .select(['-password', '-reset_token']);
        return users;
    }
    async getUser(id) {
        const user = await this.userModel
            .findById(id)
            .select(['-password', '-reset_token']);
        if (!user) {
            throw new common_1.NotFoundException('משתמש לא נמצא');
        }
        return user;
    }
    async getPayData(userId) {
        const settings = await this.settingsModel.findOne();
        const user = await this.userModel.findById(userId);
        const payData = {
            pay: settings.base_pay,
            travel: settings.travel,
            extra_travel: settings.extra_travel,
            small_eco: settings.small_eco,
            big_eco: settings.big_eco,
            extra_eco: settings.extra_eco,
            s_travel: settings.s_travel,
            recuperation: settings.recuperation,
        };
        if (settings.officer === user.nickname) {
            payData.pay = settings.base_pay3;
        }
        else {
            if (user.role.includes('SHIFT_MANAGER')) {
                payData.pay = settings.base_pay2;
            }
        }
        return { data: payData };
    }
    isValidNumber(str) {
        const regex = /^-?\d+(\.\d+)?$/;
        return regex.test(str);
    }
    async ReportData(files) {
        const fullRows = await this.readPdf(files[0].buffer);
        const indexAfter = fullRows.findIndex((row) => row.includes("ימוכיס"));
        const lineFound = fullRows[indexAfter - 1];
        const linesSplit = lineFound.split(" ");
        let data = [];
        let dataMissing = 0;
        for (let i = 0; i < linesSplit.length; i++) {
            if (linesSplit[i].length === 0) {
                dataMissing++;
            }
            if (dataMissing === 6) {
                dataMissing = 0;
                data.push("0");
                continue;
            }
            if (linesSplit[i].length === 0) {
                continue;
            }
            data.push(linesSplit[i]);
            dataMissing = 0;
        }
        let valid = true;
        for (let i = 0; i < data.length; i++) {
            if (!this.isValidNumber(data[i])) {
                valid = false;
                break;
            }
        }
        if (!valid) {
            data = new Array(18).fill("0");
        }
        if (data[data.length - 1]) {
            data.splice(data.length - 3, 2);
        }
        if (data.length < 17) {
            for (let i = 0; i < 18 - data.length; i++) {
                data.unshift("0");
            }
        }
        const floatData = data.map((item) => parseFloat(item));
        const payData = {
            s_travel: floatData[0],
            extra_eco: floatData[1],
            extra_travel: floatData[1],
            travel: floatData[2],
            small_eco: floatData[3],
            big_eco: floatData[4],
            extra_20: floatData[5],
            extra_225: floatData[6],
            extra_1875: floatData[7],
            shift_150: floatData[8],
            special_200: floatData[9],
            special_150: floatData[10],
            extra_150: floatData[11],
            extra_125: floatData[12],
            shift_100: floatData[13],
            extra_100: floatData[14],
            absence: floatData[15],
        };
        return { data: payData };
    }
    async authUser(id) {
        const user = await this.userModel
            .findById(id)
            .select(['-password', '-reset_token']);
        let manager = false;
        if (user.role.includes('ADMIN') || user.role.includes('SITE_MANAGER')) {
            manager = true;
        }
        return {
            user: true,
            manager,
            userCookie: user,
        };
    }
};
UserService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)('User')),
    __param(1, (0, mongoose_1.InjectModel)('Settings')),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model])
], UserService);
exports.UserService = UserService;
//# sourceMappingURL=user.service.js.map