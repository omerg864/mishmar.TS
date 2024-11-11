import * as mongoose from "mongoose";


export const StructureScheme = new mongoose.Schema<Structure>({
    title: {
        type: String,
        required: false,
    },
    index: {
        type: Number,
        required: true,
        default: 0,
    },
    start_time: {
        type: String,
        required: false,
        default: '07:00'
    },
    end_time: {
        type: String,
        required: false,
        default: '15:00'
    },
    shift: {
        type: Number,
        required: true,
        default: 0,
    },
    opening: {
        type: Boolean,
        required: true,
        default: false,
    },
    manager: {
        type: Boolean,
        required: true,
        default: false,
    },
    pull: {
        type: Boolean,
        required: true,
        default: false,
    }
})


export interface Structure {
    id? : mongoose.Schema.Types.ObjectId|string;
    _id? : mongoose.Schema.Types.ObjectId|string;
    title: string,
    index: number,
    start_time: string,
    end_time: string,
    shift: number,
    opening: boolean,
    manager: boolean,
    pull: boolean
}