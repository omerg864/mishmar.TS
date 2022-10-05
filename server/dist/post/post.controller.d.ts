import { PostInterface } from './post.model';
import { PostService } from './post.service';
export declare class PostController {
    private readonly postService;
    constructor(postService: PostService);
    create(post: PostInterface): Promise<PostInterface>;
    updatePost(post: PostInterface): Promise<PostInterface>;
    deletePost(id: string): Promise<string>;
    getAllPosts(): Promise<PostInterface[]>;
    getPost(id: string): Promise<PostInterface>;
}
