import * as mongoose from "mongoose";
export declare const ReinforcementScheme: mongoose.Schema<ReinforcementInterface, mongoose.Model<ReinforcementInterface, any, any, any, any>, {}, {}, {}, {}, mongoose.DefaultSchemaOptions, ReinforcementInterface>;
export interface ReinforcementInterface {
    id?: mongoose.Schema.Types.ObjectId;
    _id?: mongoose.Schema.Types.ObjectId | string;
    names: string;
    where: string;
    shift: number;
    schedule: mongoose.Schema.Types.ObjectId;
    week: number;
    day: number;
}
