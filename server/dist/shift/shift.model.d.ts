import * as mongoose from "mongoose";
export declare const ShiftScheme: mongoose.Schema<Shift, mongoose.Model<Shift, any, any, any, any>, {}, {}, {}, {}, "type", Shift>;
export interface Shift {
    id?: mongoose.Schema.Types.ObjectId;
    weekend_night: number;
    weekend_day: number;
    userId: mongoose.Schema.Types.ObjectId;
    scheduleId: mongoose.Schema.Types.ObjectId;
    weeks: Map<string, string>[];
}
