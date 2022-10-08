
type Shift = {shift: Structure|string, days: string[]}
export interface Schedule {
    _id: string;
    id: string;
    date: string;
    num_weeks: number;
    weeks: Shift[][];
    publish: boolean;
    days: string[][];
}

export interface Structure {
    id? : string;
    _id? : string;
    title: string,
    index: number,
    description: string,
    shift: number,
    opening: boolean,
    manager: boolean,
    pull: boolean
}