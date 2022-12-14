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
exports.PostService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let PostService = class PostService {
    constructor(postModel) {
        this.postModel = postModel;
    }
    async create(userId, post) {
        return await this.postModel.create(Object.assign(Object.assign({}, post), { userId: userId }));
    }
    async getPost(id) {
        const postFound = await this.postModel.findById(id).populate('userId', ["nickname"]);
        if (!postFound) {
            throw new common_1.NotFoundException('פוסט לא נמצא');
        }
        return postFound;
    }
    async getAll(query) {
        if (!query.page || query.page <= 0) {
            query.page = 0;
        }
        else {
            query.page = query.page - 1;
        }
        const postsCount = await this.postModel.find().count();
        const pages = postsCount > 0 ? Math.ceil(postsCount / 3) : 1;
        const posts = await this.postModel.find().sort({ date: -1 }).populate('userId', ["nickname"]).skip(query.page * 3).limit(3);
        return { posts, pages };
    }
    async deletePost(id) {
        const postFound = await this.postModel.findById(id);
        if (!postFound) {
            throw new common_1.NotFoundException('פוסט לא נמצא');
        }
        await this.postModel.findByIdAndDelete(id);
        return { id: postFound.id.toString() };
    }
    async updatePost(userId, post) {
        const postFound = await this.postModel.findById(post._id);
        if (!postFound) {
            throw new common_1.NotFoundException('פוסט לא נמצא');
        }
        return await this.postModel.findByIdAndUpdate(post._id, Object.assign(Object.assign({}, post), { userId: userId }), { new: true });
    }
};
PostService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)('Post')),
    __metadata("design:paramtypes", [mongoose_2.Model])
], PostService);
exports.PostService = PostService;
//# sourceMappingURL=post.service.js.map