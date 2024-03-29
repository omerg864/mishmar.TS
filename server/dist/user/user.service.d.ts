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
    authUser(id: string): Promise<{
        user: boolean;
        manager: boolean;
        userCookie: User;
    }>;
}
