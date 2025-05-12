import mongoose, { Schema, Model } from "mongoose";

import { defaultAvatar } from "../constants";

import { IUser } from "../types";

const userSchema = new Schema<IUser>(
    {
        email: { type: String, required: true, unique: true },
        name: { type: String, required: true, maxlength: 255 },
        password: { type: String, required: true },
        avatar: { type: String, default: defaultAvatar },
        lastLogin: { type: Date, default: Date.now },
        isVerified: { type: Boolean, default: false },
        resetPasswordToken: String,
        resetPasswordExpiresAt: Date,
        verificationToken: String,
        verificationTokenExpiresAt: Date,
    },
    { timestamps: true }
);

const User: Model<IUser> = mongoose.model<IUser>("User", userSchema);
export default User;
