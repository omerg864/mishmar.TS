import * as mongoose from "mongoose";


export const PostScheme = new mongoose.Schema<Post>({
    title: {
        type: String,
        required: true,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    date: {
        type: Date,
        required: true,
    }
})


export interface Post {
    title: string;
    userId: mongoose.Schema.Types.ObjectId;
    content: string;
    date: Date;
}