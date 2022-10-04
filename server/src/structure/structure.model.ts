import * as mongoose from "mongoose";


export const StructureScheme = new mongoose.Schema<Structure>({
    title: {
        type: String,
        required: true,
    },
    index: {
        type: Number,
        required: true,
        default: 0,
    },
    description: {
        type: String,
        required: true,
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
    title: string,
    index: number,
    description: string,
    shift: number,
    opening: boolean,
    manager: boolean,
    pull: boolean
}