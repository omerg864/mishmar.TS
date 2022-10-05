import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PostInterface } from './post.model';

@Injectable()
export class PostService {

    constructor(@InjectModel('Post') private readonly postModel: Model<PostInterface>) {}

    async create(post: PostInterface): Promise<PostInterface> {
        return await this.postModel.create(post);
    }

    async getPost(id: string): Promise<PostInterface> {
        const postFound = await this.postModel.findById(id);
        if (!postFound) {
            throw new NotFoundException('Post not found');
        }
        return postFound;
    }

    async getAll(): Promise<PostInterface[]>{
        const posts = await this.postModel.find();
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

    async updatePost(post: PostInterface): Promise<PostInterface> {
        const postFound = await this.postModel.findById(post.id);
        if (!postFound) {
            throw new NotFoundException('Post not found');
        }
        return await this.postModel.findByIdAndUpdate(post.id, post, { new: true});
    }
}
