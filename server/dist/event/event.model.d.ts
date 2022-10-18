import * as mongoose from "mongoose";
export declare const EventScheme: mongoose.Schema<EventInterface, mongoose.Model<EventInterface, any, any, any, any>, {}, {}, {}, {}, "type", EventInterface>;
export interface EventInterface {
    id?: mongoose.Schema.Types.ObjectId;
    _id: string | mongoose.Schema.Types.ObjectId;
    date: Date;
    content: string;
    users: mongoose.Types.ObjectId[];
}
