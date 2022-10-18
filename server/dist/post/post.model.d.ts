import * as mongoose from "mongoose";
export declare const PostScheme: mongoose.Schema<PostInterface, mongoose.Model<PostInterface, any, any, any, any>, {}, {}, {}, {}, "type", PostInterface>;
export interface PostInterface {
    id?: mongoose.Schema.Types.ObjectId;
    _id?: mongoose.Schema.Types.ObjectId | string;
    title: string;
    userId: mongoose.Schema.Types.ObjectId;
    content: string;
    date: Date;
}
