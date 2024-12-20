import { Attendee, DateArray } from "ics";

export type ShiftWeek = { shift: Structure | string; days: string[] };
export interface Schedule {
	_id: string;
	id: string;
	date: string | Date;
	num_weeks: number;
	weeks: ShiftWeek[][];
	publish: boolean;
	days: string[][];
}

export interface ScheduleUser {
	_id: string;
	date: Date;
	num_weeks: number;
	days: string[][];
}

export interface Structure {
	id: string;
	_id: string;
	title: string;
	index: number;
	start_time: string;
	end_time: string;
	shift: number;
	opening: boolean;
	manager: boolean;
	pull: boolean;
}

export interface Shift {
	id?: string;
	_id: string;
	weekend_night: number;
	weekend_day: number;
	userId: string;
	scheduleId: string;
	notes: string;
	weeks: {
		morning: boolean[];
		noon: boolean[];
		night: boolean[];
		pull: boolean[];
		reinforcement: boolean[];
		notes: string[];
	}[];
}

export interface EventType {
	_id?: string;
	content: string;
	date: string;
	users: string[] | User[];
}

export interface PostType {
	_id?: string;
	title: string;
	content: string;
	date: string;
	userId: string | User;
}

export interface User {
	_id: string;
	name: string;
	nickname: string;
	email?: string;
	username?: string;
	role?: string[];
	password?: string;
	confirmPassword?: string;
}

export interface UserStrings {
	_id: string;
	name: string;
	nickname: string;
	email?: string;
	username?: string;
	password?: string;
	confirmPassword?: string;
}

export interface UserQuality {
	_id: string;
	nickname: string;
	night: number;
	friday_noon: number;
	weekend_night: number;
	weekend_day: number;
}

export interface Settings {
	submit: boolean;
	pin_code: string;
	officer: string;
	title: string;
	max_seq_nights: number;
	max_seq_noon: number;
}

export interface SalarySettings {
	travel: number;
	extra_travel: number;
	s_travel: number;
	small_eco: number;
	big_eco: number;
	extra_eco: number;
	recuperation: number;
	base_pay: number;
	base_pay2: number;
	base_pay3: number;
	max_travel: number;
}

export interface Passwords {
	password: string;
	confirmPassword: string;
}

export interface Salary {
	absence: number;
	shift_100: number;
	extra_125: number;
	extra_150: number;
	special_150: number;
	special_200: number;
	shift_150: number;
	extra_1875: number;
	extra_225: number;
	extra_20: number;
	small_eco: number;
	big_eco: number;
	extra_eco: number;
	travel: number;
	extra_travel: number;
	extra_100: number;
	s_travel: number;
}

export interface BaseSalary {
	pay: number;
	travel: number;
	extra_travel: number;
	s_travel: number;
	small_eco: number;
	big_eco: number;
	extra_eco: number;
	recuperation: number;
	max_travel: number;
}

export interface UserShifts {
	nickname: string;
	morning: number;
	noon: number;
	night: number;
	friday_noon: number;
	weekend_night: number;
	weekend_day: number;
	morning_re: number;
	noon_re: number;
	night_re: number;
	friday_noon_re: number;
	weekend_night_re: number;
	weekend_day_re: number;
}

export interface Reinforcement {
	_id?: string;
	scheduleId: string;
	week: number;
	shift: number;
	day: number;
	names: string;
	where: string;
}

export interface CalendarEvent {
	title: string;
	location: string;
	start: DateArray;
	attendees?: Attendee[];
	duration: { hours?: number; minutes?: number };
}