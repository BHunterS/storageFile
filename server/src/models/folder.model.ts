import mongoose, { Schema, Model } from "mongoose";
import { IFolder } from "types";

const folderSchema = new Schema<IFolder>(
    {
        name: { type: String, required: true, maxlength: 255 },
        path: { type: String, required: true, maxlength: 255 },
        parentFolder: { type: String, default: "/" },
        accountId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        spaceId: {
            type: Schema.Types.ObjectId,
            ref: "Space",
        },
        users: [{ type: Schema.Types.ObjectId, ref: "User" }],
        isDeleted: { type: Boolean, default: false },
        deletedAt: { type: Date },
        originalPath: { type: String },
    },
    { timestamps: true }
);

const Folder: Model<IFolder> = mongoose.model<IFolder>("Folder", folderSchema);
export default Folder;
