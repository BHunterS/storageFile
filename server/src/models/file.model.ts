import mongoose, { Schema, Model } from "mongoose";

import { IFile } from "types";

const fileSchema = new Schema<IFile>(
    {
        name: { type: String, required: true, maxlength: 255 },
        url: { type: String, required: true },
        type: {
            type: String,
            enum: ["document", "image", "video", "audio", "other"],
            required: true,
        },
        folderPath: { type: String, default: "/", maxlength: 255 },
        accountId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        extension: { type: String, maxlength: 10 },
        size: { type: Number },
        users: [{ type: Schema.Types.ObjectId, ref: "User" }],
    },
    { timestamps: true }
);

const File: Model<IFile> = mongoose.model<IFile>("File", fileSchema);
export default File;
