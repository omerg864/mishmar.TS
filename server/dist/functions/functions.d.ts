export declare const addDays: (date: Date, days: number) => Date;
export declare const sendMail: (reciever: string, subject: string, text: string) => {
    error?: Error;
    response?: string;
};
