import * as mongoose from "mongoose";
export declare const StructureScheme: mongoose.Schema<Structure, mongoose.Model<Structure, any, any, any, any>, {}, {}, {}, {}, "type", Structure>;
export interface Structure {
    id?: mongoose.Schema.Types.ObjectId;
    title: string;
    index: number;
    description: string;
    shift: number;
    opening: boolean;
    manager: boolean;
    pull: boolean;
}
