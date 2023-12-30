import { UserService } from './user.service';
import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Patch,
	Post,
} from '@nestjs/common';
import { User } from './user.model';
import { UserID } from '../middleware/auth.middleware';

@Controller('api/users')
export class UserController {
	constructor(private readonly userService: UserService) {}

	@Post('login')
	async login(
		@Body('username') username: string,
		@Body('password') password: string
	): Promise<{ user: User; token: string }> {
		return await this.userService.login(username, password);
	}

	@Post('register')
	async register(
		@Body('user') user: User,
		@Body('pin_code') pinCode: string
	): Promise<{ message: string }> {
		return await this.userService.register(user, pinCode);
	}

	@Post('forgot')
	async forgotPasswordEmail(
		@Body('email') email: string
	): Promise<{ error?: Error; response?: string }> {
		return await this.userService.forgotPasswordEmail(email);
	}

	@Post('resetPassword/:token')
	async resetTokenPassword(
		@Body('password') password: string,
		@Param('token') reset_token: string
	): Promise<{ success: boolean }> {
		return await this.userService.resetTokenPassword(reset_token, password);
	}

	@Get('resetPassword/:token')
	async resetTokenCheck(
		@Param('token') reset_token: string
	): Promise<{ success: boolean }> {
		return await this.userService.resetTokenCheck(reset_token);
	}

	@Patch()
	async updateUser(
		@Body() user: User,
		@UserID() userId: string
	): Promise<User> {
		return await this.userService.updateUser(user, userId);
	}

	@Patch('manager')
	async updateUserManager(@Body() user: User): Promise<User> {
		return await this.userService.updateUser(user, user._id.toString());
	}

	@Patch('many')
	async updateManyUsers(@Body() users: User[]): Promise<User[]> {
		return await this.userService.updateManyUsers(users);
	}

	@Delete(':id')
	async deleteUser(@Param('id') id: string): Promise<{ id: string }> {
		return await this.userService.deleteUser(id);
	}

	@Get('all')
	async getAllUsers(): Promise<User[]> {
		return await this.userService.getAll();
	}

	@Get('auth')
	async authUser(
		@UserID() id: string
	): Promise<{ user: boolean; manager: boolean; userCookie: User }> {
		return await this.userService.authUser(id);
	}

	@Get('get/:id')
	async getUser(@Param('id') userId: string): Promise<User> {
		return await this.userService.getUser(userId);
	}
}
