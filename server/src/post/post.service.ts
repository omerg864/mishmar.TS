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

    async getAll(): Promise<PostInterface[]>{
        const posts = await this.postModel.find().populate('userId', ["nickname"]);
        return posts;
    }

    async deletePost(id: string): Promise<string> {
        const postFound = await this.postModel.findById(id);
        if (!postFound) {
            throw new NotFoundException('Post not found');
        }
        await this.postModel.findByIdAndDelete(id);
        return postFound.id.toString();
    }

    async updatePost(userId: string, post: PostInterface): Promise<PostInterface> {
        const postFound = await this.postModel.findById(post._id);
        if (!postFound) {
            throw new NotFoundException('Post not found');
        }
        return await this.postModel.findByIdAndUpdate(post._id, {...post, userId: userId}, { new: true});
    }
}
