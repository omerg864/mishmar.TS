import * as mongoose from "mongoose";
export declare const EventScheme: mongoose.Schema<Event, mongoose.Model<Event, any, any, any, any>, {}, {}, {}, {}, "type", Event>;
export interface Event {
    date: Date;
    content: string;
    users: mongoose.Types.ObjectId[];
}
