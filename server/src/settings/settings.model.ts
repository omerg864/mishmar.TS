import * as mongoose from 'mongoose';

export const SettingsScheme = new mongoose.Schema<Settings>({
	submit: {
		type: Boolean,
		default: false,
	},
	officer: {
		required: false,
		type: String,
		default: '',
	},
	pin_code: {
		required: false,
		type: String,
		default: '1234',
	},
	title: {
		required: false,
		type: String,
		default: '',
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
	},
	base_pay: {
		required: false,
		type: Number,
		default: 40,
	},
	base_pay2: {
		required: false,
		type: Number,
		default: 40.6,
	},
	base_pay3: {
		required: false,
		type: Number,
		default: 46,
	},
	travel: {
		required: false,
		type: Number,
		default: 18,
	},
	extra_travel: {
		required: false,
		type: Number,
		default: 18,
	},
	small_eco: {
		required: false,
		type: Number,
		default: 13.5,
	},
	big_eco: {
		required: false,
		type: Number,
		default: 19.7,
	},
	extra_eco: {
		required: false,
		type: Number,
		default: 33.9,
	},
	s_travel: {
		required: false,
		type: Number,
		default: 28,
	},
	recuperation: {
		required: false,
		type: Number,
		default: 250,
	},
	max_travel: {
		required: false,
		type: Number,
		default: 267,
	}
});

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