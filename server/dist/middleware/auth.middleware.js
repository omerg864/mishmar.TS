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
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserID = exports.AdminManagerMiddleware = exports.ShiftManagerMiddleware = exports.SiteManagerMiddleware = exports.AuthMiddleware = void 0;
const common_1 = require("@nestjs/common");
const common_2 = require("@nestjs/common");
const jwt = __importStar(require("jsonwebtoken"));
const common_3 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const checkUser = async (headers, userModel) => {
    if (!headers.authorization) {
        throw new common_1.UnauthorizedException('לא נמצא טוקן הזדהות');
    }
    const token = headers.authorization.split(' ')[1];
    if (!token) {
        throw new common_1.UnauthorizedException('לא נמצא טוקן הזדהות');
    }
    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        const userId = payload['id'];
        if (!userId) {
            throw new common_1.UnauthorizedException('טוקן הזדהות לא תקין');
        }
        const userFound = await userModel.findById(userId);
        if (!userFound) {
            throw new common_2.NotFoundException('משתמש לא נמצא');
        }
        return userFound;
    }
    catch (err) {
        throw new common_1.UnauthorizedException('טוקן הזדהות לא תקין');
    }
};
let AuthMiddleware = class AuthMiddleware {
    constructor(userModel) {
        this.userModel = userModel;
    }
    async use(req, res, next) {
        const user = await checkUser(req.headers, this.userModel);
        req.userId = user._id.toString();
        next();
    }
};
AuthMiddleware = __decorate([
    (0, common_3.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)('User')),
    __metadata("design:paramtypes", [mongoose_2.Model])
], AuthMiddleware);
exports.AuthMiddleware = AuthMiddleware;
let SiteManagerMiddleware = class SiteManagerMiddleware {
    constructor(userModel) {
        this.userModel = userModel;
    }
    async use(req, res, next) {
        const userFound = await checkUser(req.headers, this.userModel);
        if (!userFound.role.includes('SITE_MANAGER') &&
            !userFound.role.includes('ADMIN')) {
            throw new common_1.UnauthorizedException('רק מנהל האתר יכול לעשות בקשה זאת');
        }
        req.userId = userFound._id.toString();
        next();
    }
};
SiteManagerMiddleware = __decorate([
    (0, common_3.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)('User')),
    __metadata("design:paramtypes", [mongoose_2.Model])
], SiteManagerMiddleware);
exports.SiteManagerMiddleware = SiteManagerMiddleware;
let ShiftManagerMiddleware = class ShiftManagerMiddleware {
    constructor(userModel) {
        this.userModel = userModel;
    }
    async use(req, res, next) {
        const userFound = await checkUser(req.headers, this.userModel);
        if (!userFound.role.includes('SHIFT_MANAGER') &&
            !userFound.role.includes('ADMIN')) {
            throw new common_1.UnauthorizedException('רק אחמ"ש יכול לעשות בקשה זאת');
        }
        req.userId = userFound._id.toString();
        next();
    }
};
ShiftManagerMiddleware = __decorate([
    (0, common_3.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)('User')),
    __metadata("design:paramtypes", [mongoose_2.Model])
], ShiftManagerMiddleware);
exports.ShiftManagerMiddleware = ShiftManagerMiddleware;
let AdminManagerMiddleware = class AdminManagerMiddleware {
    constructor(userModel) {
        this.userModel = userModel;
    }
    async use(req, res, next) {
        const userFound = await checkUser(req.headers, this.userModel);
        if (!userFound.role.includes('ADMIN')) {
            throw new common_1.UnauthorizedException('רק אדמין יכול לעשות בקשה זאת');
        }
        req.userId = userFound._id.toString();
        next();
    }
};
AdminManagerMiddleware = __decorate([
    (0, common_3.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)('User')),
    __metadata("design:paramtypes", [mongoose_2.Model])
], AdminManagerMiddleware);
exports.AdminManagerMiddleware = AdminManagerMiddleware;
exports.UserID = (0, common_2.createParamDecorator)((_data, ctx) => {
    const request = ctx.switchToHttp().getRequest();
    return request.userId;
});
//# sourceMappingURL=auth.middleware.js.map