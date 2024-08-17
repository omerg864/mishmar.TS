import * as mongoose from "mongoose";
import { User } from "../user/user.model";


export const ShiftScheme = new mongoose.Schema<Shift>({
    weekend_night: {
        type: Number,
        default: 0,
        min: 0,
        required: false,
    },
    weekend_day: {
        type: Number,
        default: 0,
        min: 0,
        required: false,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    scheduleId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Schedule",
        required: true,
    },
    notes: {
        type: String,
        default: "",
    },
    weeks: [{
        morning: [{
            type: Boolean,
            default: false,
        }],
        noon: [{
            type: Boolean,
            default: false,
        }],
        night: [{
            type: Boolean,
            default: false
        }],
        pull: [{
            type: Boolean,
            default: true,
        }],
        reinforcement: [{
            type: Boolean,
            default: false,
        }],
        notes: [{
            type: String,
            default: "",
        }]
    }]
}, {timestamps: true});


export interface Shift {
    id?: mongoose.Schema.Types.ObjectId|string;
    _id: mongoose.Schema.Types.ObjectId|string;
    weekend_night: number;
    weekend_day: number;
    userId: mongoose.Schema.Types.ObjectId|User;
    scheduleId: mongoose.Schema.Types.ObjectId;
    notes: string;
    weeks: {morning: boolean[], noon: boolean[], night: boolean[], pull: boolean[], reinforcement: boolean[], notes: string[]}[];
    updatedAt?: Date;
    createdAt?: Date;
}

export interface ShiftScheduleWeek {
    morning: string[];
    noon: string[];
    night: string[]; 
    pull: string[];
    reinforcement: string[]; 
    notes: string[];
}