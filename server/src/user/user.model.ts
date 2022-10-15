import * as mongoose from "mongoose";


export const UserScheme = new mongoose.Schema<User>({
    name: {
        type: String,
        required: true,
    },
    nickname: {
        type: String,
        default: ""
    },
    username: {
        type: String,
        required: true,
        unique: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    night: {
        type: Number,
        default: 0,
        required: false,
    },
    friday_noon: {
        type: Number,
        default: 0,
        required: false
    },
    weekend_night: {
        type: Number,
        default: 0,
        required: false
    },
    weekend_day: {
        type: Number,
        default: 0,
        required: false
    },
    reset_token: {
        type: String,
        required: false,
        unique: true
    },
    role: [
        { type: String,
        enum: ["ADMIN", "SITE_MANAGER", "SHIFT_MANAGER", "USER", "EXTRA"],
        default: ["USER"]
        }
    ]
})


export interface User {
    id?: string;
    _id: string;
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