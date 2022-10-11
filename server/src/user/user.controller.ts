import { UserService } from './user.service';
import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { User } from './user.model';
import { UserID } from 'src/middleware/auth.middlware';

@Controller('user')
export class UserController {

    constructor(private readonly userService: UserService) {}

    @Post('login')
    async login(@Body('username') username: string, @Body('password') password: string) {
        return await this.userService.login(username, password);
    }

    @Post('register')
    async register(@Body('user') user: User, @Body('pin_code') pinCode: string) {
        return await this.userService.register(user, pinCode);
    }

    @Patch()
    async updateUser(@Body() user: User, @UserID() userId: string) {
        return await this.userService.updateUser(user, userId);
    }

    @Patch('many')
    async updateManyUsers(@Body() users: User[]) {
        return await this.userService.updateManyUsers(users);
    }

    @Delete(':id')
    async deleteUser(@Param('id') id: string): Promise<{ id: string}>  {
        return await this.userService.deleteUser(id);
    }

    @Get('all')
    async getAllUsers() {
        return await this.userService.getAll();
    }

    @Get('auth')
    async authUser(@UserID() id: string): Promise<{user: boolean, manager: boolean}> {
        return await this.userService.authUser(id);
    }

    @Get(':id')
    async getUser(@Param('id') id: string): Promise<User> {
        return await this.userService.getUser(id);
    }
}
