import mongoose, { Schema, Model } from "mongoose";

import { IRSAkeys } from "types";

const RSAKeysSchema = new Schema<IRSAkeys>(
    {
        accountId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true,
        },
        publicKey: {
            type: String,
            required: true,
        },
        privateKey: {
            type: String,
            required: true,
            select: false,
        },
    },
    { timestamps: true }
);

const RSAkeys: Model<IRSAkeys> = mongoose.model<IRSAkeys>(
    "RSAKeys",
    RSAKeysSchema
);
export default RSAkeys;
