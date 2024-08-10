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
