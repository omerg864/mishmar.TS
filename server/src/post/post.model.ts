import * as mongoose from "mongoose";


export const PostScheme = new mongoose.Schema<PostInterface>({
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
        required: false,
        default: "",
    },
    date: {
        type: Date,
        required: true,
    }
})


export interface PostInterface {
    id?: mongoose.Schema.Types.ObjectId;
    _id?: mongoose.Schema.Types.ObjectId|string;
    title: string;
    userId: mongoose.Schema.Types.ObjectId;
    content: string;
    date: Date;
}