import * as mongoose from "mongoose";


export const ReinforcementScheme = new mongoose.Schema<ReinforcementInterface>({
    names: {
        type: String,
        required: true,
    },
    where: {
        type: String,
        required: true,
    },
    shift: {
        type: Number,
        required: true,
    },
    schedule: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Schedule",
        required: true,
    },
    week: {
        type: Number,
        required: true,
    },
    day: {
        type: Number,
        required: true,
    }
})


export interface ReinforcementInterface {
    id?: mongoose.Schema.Types.ObjectId;
    _id?: mongoose.Schema.Types.ObjectId|string;
    names: string;
    where: string;
    shift: number;
    schedule: mongoose.Schema.Types.ObjectId;
    week: number;
    day: number;
}