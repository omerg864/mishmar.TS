import * as mongoose from "mongoose";


export const ScheduleScheme = new mongoose.Schema<Schedule>({
    date: {
        type: Date,
        required: true
    },
    num_weeks: {
        type: Number,
        required: true,
        default: 2
    },
    weeks: {
        type: mongoose.Types.Map,
        required: true,
        default: new Map<String, Object>()
    },
    publish: {
        type: Boolean,
        default: false,
        required: true
    }
});


export interface Schedule {
    date: Date;
    num_weeks: number;
    weeks: Map<String, Object>;
    publish: boolean;
}