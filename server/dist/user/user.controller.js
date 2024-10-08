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
exports.UserController = void 0;
const user_service_1 = require("./user.service");
const common_1 = require("@nestjs/common");
const auth_middleware_1 = require("../middleware/auth.middleware");
const platform_express_1 = require("@nestjs/platform-express");
let UserController = class UserController {
    constructor(userService) {
        this.userService = userService;
    }
    async login(username, password) {
        return await this.userService.login(username, password);
    }
    async google(code) {
        return await this.userService.google(code);
    }
    async getPay(userId) {
        return await this.userService.getPayData(userId);
    }
    async reportDataExtract(files) {
        return await this.userService.ReportData(files);
    }
    async register(user, pinCode) {
        return await this.userService.register(user, pinCode);
    }
    async forgotPasswordEmail(email) {
        return await this.userService.forgotPasswordEmail(email);
    }
    async resetTokenPassword(password, reset_token) {
        return await this.userService.resetTokenPassword(reset_token, password);
    }
    async resetTokenCheck(reset_token) {
        return await this.userService.resetTokenCheck(reset_token);
    }
    async updateUser(user, userId) {
        return await this.userService.updateUser(user, userId);
    }
    async updateUserManager(user) {
        return await this.userService.updateUser(user, user._id.toString());
    }
    async updateManyUsers(users) {
        return await this.userService.updateManyUsers(users);
    }
    async deleteUser(id) {
        return await this.userService.deleteUser(id);
    }
    async getAllUsers() {
        return await this.userService.getAll();
    }
    async authUser(id) {
        return await this.userService.authUser(id);
    }
    async getUser(userId) {
        return await this.userService.getUser(userId);
    }
};
__decorate([
    (0, common_1.Post)('login'),
    __param(0, (0, common_1.Body)('username')),
    __param(1, (0, common_1.Body)('password')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "login", null);
__decorate([
    (0, common_1.Post)('google'),
    __param(0, (0, common_1.Body)('code')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "google", null);
__decorate([
    (0, common_1.Get)('pay'),
    __param(0, (0, auth_middleware_1.UserID)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "getPay", null);
__decorate([
    (0, common_1.Post)('report'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)('file')),
    __param(0, (0, common_1.UploadedFiles)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "reportDataExtract", null);
__decorate([
    (0, common_1.Post)('register'),
    __param(0, (0, common_1.Body)('user')),
    __param(1, (0, common_1.Body)('pin_code')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "register", null);
__decorate([
    (0, common_1.Post)('forgot'),
    __param(0, (0, common_1.Body)('email')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "forgotPasswordEmail", null);
__decorate([
    (0, common_1.Post)('resetPassword/:token'),
    __param(0, (0, common_1.Body)('password')),
    __param(1, (0, common_1.Param)('token')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "resetTokenPassword", null);
__decorate([
    (0, common_1.Get)('resetPassword/:token'),
    __param(0, (0, common_1.Param)('token')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "resetTokenCheck", null);
__decorate([
    (0, common_1.Patch)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, auth_middleware_1.UserID)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "updateUser", null);
__decorate([
    (0, common_1.Patch)('manager'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "updateUserManager", null);
__decorate([
    (0, common_1.Patch)('many'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "updateManyUsers", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "deleteUser", null);
__decorate([
    (0, common_1.Get)('all'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], UserController.prototype, "getAllUsers", null);
__decorate([
    (0, common_1.Get)('auth'),
    __param(0, (0, auth_middleware_1.UserID)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "authUser", null);
__decorate([
    (0, common_1.Get)('get/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "getUser", null);
UserController = __decorate([
    (0, common_1.Controller)('api/users'),
    __metadata("design:paramtypes", [user_service_1.UserService])
], UserController);
exports.UserController = UserController;
//# sourceMappingURL=user.controller.js.map