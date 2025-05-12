import { NextFunction, Request, Response } from "express";

import Profile from "../models/profile.model";
import User from "../models/user.model";

import { createError } from "../utils/createError";

import { RequestWithUserId, GetProfileBody, IUser, IProfile } from "types";

export const getProfile = async (
    req: RequestWithUserId,
    res: Response,
    next: NextFunction
) => {
    try {
        const accountId = req.userId!;

        let profile = await Profile.findOne({ accountId });
        if (!profile) profile = await Profile.create({ accountId });

        const userInfo = await User.findById(accountId)
            .select("email name avatar")
            .lean();

        res.json({
            success: true,
            message: "Profile successfully found",
            profile,
            user: userInfo,
        });
    } catch (error) {
        next(error);
    }
};

export const createOrUpdateProfile = async (
    req: RequestWithUserId,
    res: Response,
    next: NextFunction
) => {
    try {
        const accountId = req.userId!;

        const {
            email,
            name,
            avatar,
            bio,
            location,
            phone,
            birthday,
        }: GetProfileBody = req.body;

        let profile = await Profile.findOne({ accountId });
        let user = await User.findOne({ email });

        if (user) {
            user = await User.findOneAndUpdate(
                { email },
                { $set: { email, name, avatar } },
                { new: true }
            );
        }

        if (profile) {
            profile = await Profile.findOneAndUpdate(
                { accountId },
                { $set: { bio, location, phone, birthday } },
                { new: true }
            );
        } else {
            profile = new Profile({
                bio,
                location,
                phone,
                birthday,
                accountId,
            });
            await profile.save();
        }

        res.json({
            success: true,
            message: "Profile succesfully updated",
        });
    } catch (error) {
        next(error);
    }
};
