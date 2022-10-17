
export type ShiftWeek = {shift: Structure|string, days: string[]}
export interface Schedule {
    _id: string;
    id: string;
    date: string|Date;
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
    id : string;
    _id : string;
    title: string,
    index: number,
    description: string,
    shift: number,
    opening: boolean,
    manager: boolean,
    pull: boolean
}

export interface Shift {
    id?: string;
    _id: string;
    weekend_night: number;
    weekend_day: number;
    userId: string;
    scheduleId: string;
    notes: string;
    weeks: {morning: boolean[], noon: boolean[], night: boolean[], pull: boolean[], reinforcement: boolean[], notes: string[]}[];
}

export interface EventType {
    _id?: string;
    content: string;
    date: string;
    users: string[]|User[];
}

export interface PostType {
    _id?: string;
    title: string;
    content: string;
    date: string;
    userId: string|User;
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