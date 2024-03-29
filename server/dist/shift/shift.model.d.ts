import * as mongoose from "mongoose";
import { User } from "../user/user.model";
export declare const ShiftScheme: mongoose.Schema<Shift, mongoose.Model<Shift, any, any, any, any>, {}, {}, {}, {}, mongoose.DefaultSchemaOptions, Shift>;
export interface Shift {
    id?: mongoose.Schema.Types.ObjectId | string;
    _id: mongoose.Schema.Types.ObjectId | string;
    weekend_night: number;
    weekend_day: number;
    userId: mongoose.Schema.Types.ObjectId | User;
    scheduleId: mongoose.Schema.Types.ObjectId;
    notes: string;
    weeks: {
        morning: boolean[];
        noon: boolean[];
        night: boolean[];
        pull: boolean[];
        reinforcement: boolean[];
        notes: string[];
    }[];
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
