import mongoose, { Schema, Model } from "mongoose";
import { IProfile } from "types";

const profileSchema = new Schema<IProfile>(
    {
        accountId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true,
        },
        bio: { type: String, maxlength: 1024 },
        location: { type: String, maxlength: 255 },
        phone: { type: String },
        birthday: { type: Date },
    },
    { timestamps: true }
);

const Profile: Model<IProfile> = mongoose.model<IProfile>(
    "Profile",
    profileSchema
);
export default Profile;
