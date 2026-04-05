/// <reference types="multer" />
import { UserService } from './user.service';
import { User } from './user.model';
export declare class UserController {
    private readonly userService;
    constructor(userService: UserService);
    login(username: string, password: string): Promise<{
        user: User;
        token: string;
    }>;
    google(code: string): Promise<{
        user: User;
        token: string;
    }>;
    getPay(userId: string): Promise<{
        data: {
            travel: number;
            extra_travel: number;
            small_eco: number;
            big_eco: number;
            extra_eco: number;
            pay: number;
            s_travel: number;
            recuperation: number;
            max_travel: number;
        };
    }>;
    reportDataExtract(files: Express.Multer.File[]): Promise<{
        data: {
            s_travel: number;
            extra_eco: number;
            extra_travel: number;
            travel: number;
            small_eco: number;
            big_eco: number;
            extra_20: number;
            extra_225: number;
            extra_1875: number;
            shift_150: number;
            special_200: number;
            special_150: number;
            extra_150: number;
            extra_125: number;
            shift_100: number;
            extra_100: number;
            absence: number;
        };
    }>;
    register(user: User, pinCode: string): Promise<{
        message: string;
    }>;
    forgotPasswordEmail(email: string): Promise<{
        error?: Error;
        response?: string;
    }>;
    resetTokenPassword(password: string, reset_token: string): Promise<{
        success: boolean;
    }>;
    resetTokenCheck(reset_token: string): Promise<{
        success: boolean;
    }>;
    updateUser(user: User, userId: string): Promise<User>;
    updateUserManager(user: User): Promise<User>;
    updateManyUsers(users: User[]): Promise<User[]>;
    deleteUser(id: string): Promise<{
        id: string;
    }>;
    getAllUsers(): Promise<User[]>;
    authUser(id: string): Promise<{
        user: boolean;
        manager: boolean;
        userCookie: User;
    }>;
    getUser(userId: string): Promise<User>;
}
