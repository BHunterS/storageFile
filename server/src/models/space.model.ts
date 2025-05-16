import mongoose, { Schema, Model } from "mongoose";
import { ISpace } from "types";

const spaceSchema = new Schema<ISpace>(
    {
        name: { type: String, required: true, maxlength: 255 },
        description: { type: String, maxlength: 1024 },
        owner: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        members: [
            {
                user: {
                    type: Schema.Types.ObjectId,
                    ref: "User",
                    required: true,
                },
                role: {
                    type: String,
                    enum: ["admin", "editor", "viewer"],
                    default: "viewer",
                },
                addedAt: { type: Date, default: Date.now },
            },
        ],
        logo: { type: String },
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

const Space: Model<ISpace> = mongoose.model<ISpace>("Space", spaceSchema);
export default Space;
