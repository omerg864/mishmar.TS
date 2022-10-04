import * as mongoose from "mongoose";


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
    },
    scheduleId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Schedule",
    },
    weeks: {
        type: mongoose.Schema.Types.Map,
        default: new Map<string, Object>(),
        required: false,
    }
});


export interface Shift {
    weekend_night: number;
    weekend_day: number;
    userId: mongoose.Schema.Types.ObjectId;
    scheduleId: mongoose.Schema.Types.ObjectId;
    weeks: Map<string, Object>;
}