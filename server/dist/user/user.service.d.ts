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
            max_travel: number;
        };
    }>;
    readPdf: (buffer: Buffer) => Promise<string[]>;
    isValidNumber(str: string): boolean;
    ReportData(files: Express.Multer.File[]): Promise<{
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
    authUser(id: string): Promise<{
        user: boolean;
        manager: boolean;
        userCookie: User;
    }>;
}
