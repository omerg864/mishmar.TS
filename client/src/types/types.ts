
type Day = {shift: Structure, value: string}[]
export interface Schedule {
    _id: string;
    id: string;
    date: string;
    num_weeks: number;
    weeks: { "0": Day, "1": Day, "2": Day, "3": Day, "4": Day, "5": Day, "6": Day}[];
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