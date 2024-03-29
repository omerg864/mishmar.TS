import { PostInterface } from './post.model';
import { PostService } from './post.service';
export declare class PostController {
    private readonly postService;
    constructor(postService: PostService);
    create(userId: string, post: PostInterface): Promise<PostInterface>;
    updatePost(userId: string, post: PostInterface): Promise<PostInterface>;
    deletePost(id: string): Promise<{
        id: string;
    }>;
    getAllPosts(query: {
        page?: number;
    }): Promise<{
        posts: PostInterface[];
        pages: number;
    }>;
    getPost(id: string): Promise<PostInterface>;
}
