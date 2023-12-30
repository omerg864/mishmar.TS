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
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const functions_1 = require("../functions/functions");
const crypto = require("crypto");
const regularExpressions_1 = require("../types/regularExpressions");
let UserService = class UserService {
    constructor(userModel, settingsModel) {
        this.userModel = userModel;
        this.settingsModel = settingsModel;
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