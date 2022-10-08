import * as mongoose from "mongoose";
import { Structure } from "src/structure/structure.model";


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
    weeks: [[
        {
            shift: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Structure",
                required: true
            },
            days: [
                {
                    type: String,
                    required: true,
                    default: ""
                }
            ]
        },
    ]],
    publish: {
        type: Boolean,
        default: false,
        required: true
    },
});


export interface Schedule {
    _id: mongoose.Schema.Types.ObjectId|string;
    id: mongoose.Schema.Types.ObjectId|string;
    date: Date;
    num_weeks: number;
    weeks: {shift: mongoose.Schema.Types.ObjectId|Structure|string , days: string[]}[][];
    publish: boolean;
    days?: Date[][];
}