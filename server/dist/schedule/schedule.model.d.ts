import * as mongoose from "mongoose";
import { Structure } from "../structure/structure.model";
export declare const ScheduleScheme: mongoose.Schema<Schedule, mongoose.Model<Schedule, any, any, any, any>, {}, {}, {}, {}, "type", Schedule>;
export interface Schedule {
    _id: mongoose.Schema.Types.ObjectId | string;
    id: mongoose.Schema.Types.ObjectId | string;
    date: Date;
    num_weeks: number;
    weeks: {
        shift: mongoose.Schema.Types.ObjectId | Structure | string;
        days: string[];
    }[][];
    publish: boolean;
    days?: Date[][];
}
