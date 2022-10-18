import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PostInterface } from './post.model';

@Injectable()
export class PostService {

    constructor(@InjectModel('Post') private readonly postModel: Model<PostInterface>) {}

    async create(userId: string, post: PostInterface): Promise<PostInterface> {
        return await this.postModel.create({...post, userId: userId});
    }

    async getPost(id: string): Promise<PostInterface> {
        const postFound = await this.postModel.findById(id).populate('userId', ["nickname"]);
        if (!postFound) {
            throw new NotFoundException('Post not found');
        }
        return postFound;
    }

    async getAll(query: {page?: number}): Promise<{posts: PostInterface[], pages: number}>{
        if (!query.page || query.page <= 0) {
            query.page = 0;
        } else {
            query.page = query.page - 1;
        }
        const postsCount = await this.postModel.find().count();
        const pages = postsCount > 0 ? Math.ceil(postsCount / 3) : 1;
        const posts = await this.postModel.find().populate('userId', ["nickname"]).skip(query.page * 3).limit(3);
        return {posts, pages};
    }

    async deletePost(id: string): Promise<{id: string}> {
        const postFound = await this.postModel.findById(id);
        if (!postFound) {
            throw new NotFoundException('Post not found');
        }
        await this.postModel.findByIdAndDelete(id);
        return {id: postFound.id.toString()};
    }

    async updatePost(userId: string, post: PostInterface): Promise<PostInterface> {
        const postFound = await this.postModel.findById(post._id);
        if (!postFound) {
            throw new NotFoundException('Post not found');
        }
        return await this.postModel.findByIdAndUpdate(post._id, {...post, userId: userId}, { new: true});
    }
}
