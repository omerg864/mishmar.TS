import * as mongoose from "mongoose";
export declare const ShiftScheme: mongoose.Schema<Shift, mongoose.Model<Shift, any, any, any, any>, {}, {}, {}, {}, "type", Shift>;
export interface Shift {
    weekend_night: number;
    weekend_day: number;
    userId: mongoose.Schema.Types.ObjectId;
    scheduleId: mongoose.Schema.Types.ObjectId;
    weeks: Map<string, Object>;
}
