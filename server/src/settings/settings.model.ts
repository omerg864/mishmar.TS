import * as mongoose from "mongoose";

export const SettingsScheme = new mongoose.Schema<Settings>({
    submit: {
        type: Boolean,
        default: false,
    },
    officer: {
        required: false,
        type: String,
        default: "",
    },
    pin_code: {
        required: false,
        type: String,
        default: "1234",
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
    pin_code: string;
    officer: string;
    title: string;
    max_seq_nights: number;
    max_seq_noon: number;
}