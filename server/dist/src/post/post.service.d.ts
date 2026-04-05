import { Model } from 'mongoose';
import { PostInterface } from './post.model';
export declare class PostService {
    private readonly postModel;
    constructor(postModel: Model<PostInterface>);
    create(userId: string, post: PostInterface): Promise<PostInterface>;
    getPost(id: string): Promise<PostInterface>;
    getAll(query: {
        page?: number;
    }): Promise<{
        posts: PostInterface[];
        pages: number;
    }>;
    deletePost(id: string): Promise<{
        id: string;
    }>;
    updatePost(userId: string, post: PostInterface): Promise<PostInterface>;
}
