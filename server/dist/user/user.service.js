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
let UserService = class UserService {
    constructor(userModel, settingsModel) {
        this.userModel = userModel;
        this.settingsModel = settingsModel;
    }
    generateToken(id) {
        return jwt.sign({ id }, "ABC", { expiresIn: '30d' });
    }
    async login(username, password) {
        const user = await this.userModel.findOne({ username }).select('-reset_token');
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            throw new common_1.UnauthorizedException('Incorrect password');
        }
        const token = this.generateToken(user.id);
        delete user["_doc"].password;
        return { user: Object.assign({}, user["_doc"]), token };
    }
    async register(user, pin_code) {
        let userFound = await this.userModel.findOne({ email: { $regex: new RegExp(user.username, "i") } });
        if (userFound) {
            throw new common_1.ConflictException('username already in use');
        }
        userFound = await this.userModel.findOne({ email: { $regex: new RegExp(user.email, "i") } });
        if (userFound) {
            throw new common_1.ConflictException('email already in use');
        }
        let settings = await this.settingsModel.findOne();
        if (!settings) {
            settings = new this.settingsModel();
            await settings.save();
        }
        if (settings.pin_code !== pin_code) {
            throw new common_1.UnauthorizedException('Pin code incorrect');
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(user.password, salt);
        const newUser = await this.userModel.create(Object.assign(Object.assign({}, user), { password: hashedPassword }));
        return {
            message: "Success"
        };
    }
    async updateManyUsers(users) {
        let users_temp = [];
        for (let i = 0; i < users.length; i++) {
            let userObj = Object.assign({}, users[i]);
            if (userObj.password) {
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(userObj.password, salt);
                userObj.password = hashedPassword;
            }
            const updatedUser = await this.userModel.findByIdAndUpdate(userObj._id, userObj, { new: true }).select(['-password', '-reset_token']);
            users_temp.push(updatedUser);
        }
        return users_temp;
    }
    async forgotPasswordEmail(email) {
        const userFound = await this.userModel.findOne({ email: { $regex: new RegExp(email, "i") } });
        if (!userFound) {
            throw new common_1.NotFoundException(`User with email ${email} not found`);
        }
        var generatedToken = crypto.randomBytes(26).toString('hex');
        while (await this.userModel.findOne({ reset_token: generatedToken })) {
            generatedToken = crypto.randomBytes(26).toString('hex');
        }
        userFound.reset_token = generatedToken;
        await userFound.save();
        return (0, functions_1.sendMail)(email, "Reset User Password", `To reset your password please go to:\n ${process.env.SITE_ADDRESS}/password/reset/${generatedToken}`);
    }
    async resetTokenPassword(reset_token, password) {
        const userFound = await this.userModel.findOne({ reset_token });
        if (!userFound) {
            throw new common_1.NotFoundException(`User token not valid`);
        }
        if (password) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            userFound.password = hashedPassword;
            var generatedToken = crypto.randomBytes(26).toString('hex');
            while (await this.userModel.findOne({ reset_token: generatedToken })) {
                generatedToken = crypto.randomBytes(26).toString('hex');
            }
            userFound.reset_token = generatedToken;
            await userFound.save();
            return {
                success: true
            };
        }
        else {
            throw new common_1.ConflictException('No Password Provided');
        }
    }
    async resetTokenCheck(reset_token) {
        const userFound = await this.userModel.findOne({ reset_token });
        if (!userFound) {
            throw new common_1.NotFoundException(`User token not valid`);
        }
        return {
            success: true
        };
    }
    async updateUser(user, userId) {
        let userObj = Object.assign({}, user);
        if (userObj.role) {
            delete userObj.role;
        }
        if (userObj._id) {
            delete userObj._id;
        }
        if (user.password) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(user.password, salt);
            userObj["password"] = hashedPassword;
        }
        const updatedUser = await this.userModel.findByIdAndUpdate(userId, userObj, { new: true }).select(['-password', '-reset_token']);
        return updatedUser;
    }
    async deleteUser(userId) {
        const user = await this.userModel.findById(userId);
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        await user.delete();
        return { id: user.id.toString() };
    }
    async getAll() {
        const users = await this.userModel.find().select(['-password', '-reset_token']);
        return users;
    }
    async getUser(id) {
        const user = await this.userModel.findById(id).select(['-password', '-reset_token']);
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        return user;
    }
    async authUser(id) {
        const user = await this.userModel.findById(id);
        let manager = false;
        if (user.role.includes('ADMIN') || user.role.includes('SITE_MANAGER')) {
            manager = true;
        }
        return {
            user: true,
            manager
        };
    }
};
UserService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)('User')),
    __param(1, (0, mongoose_1.InjectModel)('Settings')),
    __metadata("design:paramtypes", [mongoose_2.Model, mongoose_2.Model])
], UserService);
exports.UserService = UserService;
//# sourceMappingURL=user.service.js.map