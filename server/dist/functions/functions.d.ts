export declare const googleAuthClient: import("google-auth-library").OAuth2Client;
export declare const addDays: (date: Date, days: number) => Date;
export declare const addHours: (date: Date, hours: number) => Date;
export declare const dateToStringShort: (date: Date) => string;
export declare const DateTimeToString: (date: Date) => string;
export declare const dateToString: (date: Date) => string;
export declare const numberToDay: (num: number) => string;
export declare const stringInArray: (name: string, array: string[]) => boolean;
export declare const compareTwoArrays: (arr1: string[], arr2: string[]) => string[];
export declare const getRandomIndex: (arrayLength: number) => number;
export declare const sendMail: (receiver: string | string[], subject: string, text: string) => {
    error?: Error;
    response?: string;
};
