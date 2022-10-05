import * as mongoose from "mongoose";
export declare const SettingsScheme: mongoose.Schema<Settings, mongoose.Model<Settings, any, any, any, any>, {}, {}, {}, {}, "type", Settings>;
export interface Settings {
    submit: boolean;
    officer: string;
    title: string;
    max_seq_nights: number;
    max_seq_noon: number;
}
