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
        };
    }>;
    reportDataExtract(files: Express.Multer.File[]): Promise<{
        data: {
            s_travel: any;
            extra_eco: any;
            extra_travel: any;
            travel: any;
            small_eco: any;
            big_eco: any;
            extra_20: any;
            extra_225: any;
            extra_1875: any;
            shift_150: any;
            special_200: any;
            special_150: any;
            extra_150: any;
            extra_125: any;
            shift_100: any;
            extra_100: any;
            absence: any;
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
