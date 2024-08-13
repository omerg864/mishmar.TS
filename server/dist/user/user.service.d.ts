/// <reference types="node" />
/// <reference types="multer" />
import { User } from './user.model';
import { Model } from 'mongoose';
import { Settings } from '../settings/settings.model';
export declare class UserService {
    private readonly userModel;
    private readonly settingsModel;
    constructor(userModel: Model<User>, settingsModel: Model<Settings>);
    generateToken(id: string): string;
    login(username: string, password: string): Promise<{
        user: User;
        token: string;
    }>;
    google(code: string): Promise<{
        user: User;
        token: string;
    }>;
    register(user: User, pin_code: string): Promise<{
        message: string;
    }>;
    updateManyUsers(users: User[]): Promise<User[]>;
    forgotPasswordEmail(email: string): Promise<{
        error?: Error;
        response?: string;
    }>;
    resetTokenPassword(reset_token: string, password: string): Promise<{
        success: boolean;
    }>;
    resetTokenCheck(reset_token: string): Promise<{
        success: boolean;
    }>;
    updateUser(user: User, userId: string): Promise<User>;
    deleteUser(userId: string): Promise<{
        id: string;
    }>;
    getAll(): Promise<User[]>;
    getUser(id: string): Promise<User>;
    getPayData(userId: string): Promise<{
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
    readPdf: (buffer: Buffer, lines: string[]) => Promise<string[]>;
    ReportData(files: Express.Multer.File[]): Promise<{
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
    authUser(id: string): Promise<{
        user: boolean;
        manager: boolean;
        userCookie: User;
    }>;
}
