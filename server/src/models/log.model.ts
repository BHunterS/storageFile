import mongoose, { Schema, Model } from "mongoose";

import { ILog } from "../types";

const logSchema = new Schema<ILog>(
    {
        accountId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        action: { type: String, required: true },
        targetType: { type: String, required: true },
        targetName: { type: String, required: true },
        targetMessage: { type: String, required: true },
    },
    { timestamps: true }
);

const Log: Model<ILog> = mongoose.model<ILog>("Log", logSchema);
export default Log;
