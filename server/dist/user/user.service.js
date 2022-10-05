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
let UserService = class UserService {
    constructor(userModel) {
        this.userModel = userModel;
    }
    generateToken(id) {
        return jwt.sign({ id }, "ABC", { expiresIn: '30d' });
    }
    async login(username, password) {
        const user = await this.userModel.findOne({ username });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            throw new common_1.UnauthorizedException('Incorrect password');
        }
        const token = this.generateToken(user.id);
        return Object.assign(Object.assign({}, user["_doc"]), { token });
    }
    async register(user) {
        let userFound = await this.userModel.findOne({ email: { $regex: new RegExp(user.username, "i") } });
        if (userFound) {
            throw new common_1.ConflictException('username already in use');
        }
        userFound = await this.userModel.findOne({ email: { $regex: new RegExp(user.email, "i") } });
        if (userFound) {
            throw new common_1.ConflictException('email already in use');
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(user.password, salt);
        const newUser = await this.userModel.create(Object.assign(Object.assign({}, user), { password: hashedPassword }));
        return {
            message: "Success"
        };
    }
    async updateUser(user, userId) {
        let userObj = Object.assign({}, user);
        if (user.password) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(user.password, salt);
            userObj["password"] = hashedPassword;
        }
        const updatedUser = await this.userModel.findByIdAndUpdate(userId, userObj, { new: true });
        return updatedUser;
    }
    async deleteUser(userId) {
        const user = await this.userModel.findById(userId);
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        await user.delete();
        return user.id.toString();
    }
    async getAll() {
        const users = await this.userModel.find();
        return users;
    }
};
UserService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)('User')),
    __metadata("design:paramtypes", [mongoose_2.Model])
], UserService);
exports.UserService = UserService;
//# sourceMappingURL=user.service.js.map