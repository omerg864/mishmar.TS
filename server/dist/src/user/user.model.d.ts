import * as mongoose from "mongoose";
export declare const UserScheme: mongoose.Schema<User, mongoose.Model<User, any, any, any, any>, {}, {}, {}, {}, mongoose.DefaultSchemaOptions, User>;
export interface User {
    id?: string;
    _id: string | mongoose.Schema.Types.ObjectId;
    name: string;
    nickname: string;
    username: string;
    email: string;
    password: string;
    night: number;
    friday_noon: number;
    weekend_night: number;
    weekend_day: number;
    role: string[];
    reset_token?: string;
}
