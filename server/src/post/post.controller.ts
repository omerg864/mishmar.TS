import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { UserID } from 'src/middleware/auth.middlware';
import { PostInterface } from './post.model';
import { PostService } from './post.service';

@Controller('api/posts')
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
    async deletePost(@Param('id') id: string): Promise<{id: string}> {
        return this.postService.deletePost(id);
    }

    @Get('all')
    async getAllPosts(@Query() query: { page?: number }): Promise<{ posts: PostInterface[], pages: number}> {
        return this.postService.getAll(query);
    }

    @Get(':id')
    async getPost(@Param('id') id: string): Promise<PostInterface> {
        return this.postService.getPost(id);
    }

}
