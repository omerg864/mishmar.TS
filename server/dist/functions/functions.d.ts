export declare const addDays: (date: Date, days: number) => Date;
export declare const dateToStringShort: (date: Date) => string;
export declare const DateTimeToString: (date: Date) => string;
export declare const dateToString: (date: Date) => string;
export declare const numberToDay: (num: number) => string;
export declare const sendMail: (receiver: string | string[], subject: string, text: string) => {
    error?: Error;
    response?: string;
};
