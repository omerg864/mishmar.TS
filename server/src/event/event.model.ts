import * as mongoose from "mongoose";


export const EventScheme = new mongoose.Schema<Event>({
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


export interface Event {
    date: Date;
    content: string;
    users: mongoose.Types.ObjectId[];
}