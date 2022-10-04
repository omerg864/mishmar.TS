import * as mongoose from "mongoose";
export declare const PostScheme: mongoose.Schema<Post, mongoose.Model<Post, any, any, any, any>, {}, {}, {}, {}, "type", Post>;
export interface Post {
    title: string;
    userId: mongoose.Schema.Types.ObjectId;
    content: string;
    date: Date;
}
