import * as mongoose from "mongoose";
export declare const ScheduleScheme: mongoose.Schema<Schedule, mongoose.Model<Schedule, any, any, any, any>, {}, {}, {}, {}, "type", Schedule>;
export interface Schedule {
    date: Date;
    num_weeks: number;
    weeks: Map<String, Object>;
    publish: boolean;
}
