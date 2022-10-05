import * as mongoose from "mongoose";
export declare const ScheduleScheme: mongoose.Schema<Schedule, mongoose.Model<Schedule, any, any, any, any>, {}, {}, {}, {}, "type", Schedule>;
export interface Schedule {
    id?: mongoose.Schema.Types.ObjectId;
    date: Date;
    num_weeks: number;
    weeks: Map<string, string>[];
    publish: boolean;
}
