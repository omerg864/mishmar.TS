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
    weeks: [{
        type: mongoose.Schema.Types.Map,
        required: true,
        off: new mongoose.Schema({
            value: {
                type: String,
                required: true,
                default: ''
            },
            shift : {
                type: mongoose.Schema.Types.ObjectId,
                required: true,
                ref: 'Structure'
            }
        })
    }],
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
    weeks: Map<string, {shift: string|mongoose.Schema.Types.ObjectId|Structure, value: string}[]>[]|Object[];
    publish: boolean;
    days?: Date[][];
}