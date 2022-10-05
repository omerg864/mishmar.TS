import { Model } from 'mongoose';
import { PostInterface } from './post.model';
export declare class PostService {
    private readonly postModel;
    constructor(postModel: Model<PostInterface>);
    create(post: PostInterface): Promise<PostInterface>;
    getPost(id: string): Promise<PostInterface>;
    getAll(): Promise<PostInterface[]>;
    deletePost(id: string): Promise<string>;
    updatePost(post: PostInterface): Promise<PostInterface>;
}
