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
    weeks: [{
        type: mongoose.Schema.Types.Map,
        required: true,
        default: new Map()
    }],
    publish: {
        type: Boolean,
        default: false,
        required: true
    }
});


export interface Schedule {
    id?: mongoose.Schema.Types.ObjectId;
    date: Date;
    num_weeks: number;
    weeks: Map<string, string>[];
    publish: boolean;
}