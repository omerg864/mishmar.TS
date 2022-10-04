import * as mongoose from "mongoose";

export const SettingsScheme = new mongoose.Schema<Settings>({
    submit: {
        required: true,
        type: Boolean,
        default: false,
    },
    officer: {
        required: false,
        type: String,
        default: "",
    },
    title: {
        required: false,
        type: String,
        default: "",
    },
    max_seq_nights: {
        required: false,
        type: Number,
        default: 2,
    },
    max_seq_noon: {
        required: false,
        type: Number,
        default: 2,
    }
})


export interface Settings {
    submit: boolean;
    officer: string;
    title: string;
    max_seq_nights: number;
    max_seq_noon: number;
}