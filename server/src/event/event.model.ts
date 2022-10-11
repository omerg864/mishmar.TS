import * as mongoose from "mongoose";


export const EventScheme = new mongoose.Schema<EventInterface>({
    date: {
        type: Date,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    users: [
        { 
            type: mongoose.Types.ObjectId,
            ref: "User",
            required: true
        }
    ]
})


export interface EventInterface {
    id?: mongoose.Schema.Types.ObjectId;
    _id: string|mongoose.Schema.Types.ObjectId;
    date: Date;
    content: string;
    users: mongoose.Types.ObjectId[];
}