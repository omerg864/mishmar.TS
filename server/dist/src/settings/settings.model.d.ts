import * as mongoose from 'mongoose';
export declare const SettingsScheme: mongoose.Schema<Settings, mongoose.Model<Settings, any, any, any, any>, {}, {}, {}, {}, mongoose.DefaultSchemaOptions, Settings>;
export interface Settings {
    submit: boolean;
    pin_code: string;
    officer: string;
    title: string;
    max_seq_nights: number;
    max_seq_noon: number;
    base_pay: number;
    base_pay2: number;
    base_pay3: number;
    travel: number;
    extra_travel: number;
    small_eco: number;
    big_eco: number;
    extra_eco: number;
    s_travel: number;
    recuperation: number;
    max_travel: number;
}
export interface BaseSalary {
    pay: number;
    travel: number;
    extra_travel: number;
    small_eco: number;
    big_eco: number;
    extra_eco: number;
    max_travel: number;
}
