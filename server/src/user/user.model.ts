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
    role: [
        { type: String,
        enum: ["ADMIN", "SITE_MANAGER", "SHIFT_MANAGER", "USER", "EXTRA"],
        default: ["USER"]
        }
    ]
})


export interface User {
    id?: string;
    name: string;
    nickname: string;
    username: string;
    email: string;
    password: string;
    friday_noon: number;
    weekend_night: number;
    weekend_day: number;
    role: string[];
}