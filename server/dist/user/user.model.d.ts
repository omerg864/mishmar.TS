import * as mongoose from "mongoose";
export declare const UserSceme: mongoose.Schema<User, mongoose.Model<User, any, any, any, any>, {}, {}, {}, {}, "type", User>;
export interface User {
    id?: string;
    name: string;
    nickname: string;
    email: string;
    password: string;
    friday_noon: number;
    weekend_night: number;
    weekend_day: number;
    role: number;
}
