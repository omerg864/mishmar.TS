import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { UserID } from 'src/middleware/auth.middlware';
import { PostInterface } from './post.model';
import { PostService } from './post.service';

@Controller('post')
export class PostController {
    constructor(private readonly postService: PostService) {}

    @Post()
    async create(@UserID() userId: string, @Body() post: PostInterface): Promise<PostInterface> {
        return this.postService.create(userId, post);
    }

    @Patch()
    async updatePost(@UserID() userId: string, @Body() post: PostInterface): Promise<PostInterface> {
        return this.postService.updatePost(userId, post);
    }

    @Delete(':id')
    async deletePost(@Param('id') id: string): Promise<string> {
        return this.postService.deletePost(id);
    }

    @Get('all')
    async getAllPosts(): Promise<PostInterface[]> {
        return this.postService.getAll();
    }

    @Get(':id')
    async getPost(@Param('id') id: string): Promise<PostInterface> {
        return this.postService.getPost(id);
    }

}
