import { NextFunction, Request, Response } from "express";
import bcryptjs from "bcryptjs";
import crypto from "crypto";

import {
    sendPasswordResetEmail,
    sendResetSuccessEmail,
    sendVerificationEmail,
    sendWelcomeEmail,
} from "../mail/emails";

import User from "../models/user.model";

import { generateTokenAndSetCookie } from "../utils/generateTokenAndSetCookie";
import { createError } from "../utils/createError";

import {
    SignupRequestBody,
    LoginBody,
    VerifyEmailBody,
    ForgotPasswordBody,
    ResetPasswordBody,
    ResetPasswordParams,
} from "types/auth";
import { User as user, RequestWithUserId } from "types";

export const signup = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    const { email, password, name }: SignupRequestBody = req.body;

    try {
        if (!email || !password || !name)
            throw createError(400, "All fields are required");

        const userAlreadyExists = await User.findOne({ email });
        if (userAlreadyExists) throw createError(400, "User already exists!");

        const hashedPassword: string = await bcryptjs.hash(password, 10);
        const verificationToken: string = Math.floor(
            100000 + Math.random() * 900000
        ).toString();

        const user = new User({
            email,
            password: hashedPassword,
            name,
            avatar: "",
            verificationToken,
            verificationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
        }) as user;

        await user.save();

        generateTokenAndSetCookie(res, user._id.toString());

        await sendVerificationEmail(user.email, verificationToken);

        res.status(201).json({
            success: true,
            message: "User created successfully",
            user: {
                ...user.toObject(),
                password: undefined,
            },
        });
    } catch (error) {
        next(error);
    }
};

export const verifyEmail = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { code }: VerifyEmailBody = req.body;

    try {
        const user = await User.findOne({
            verificationToken: code,
            verificationTokenExpiresAt: { $gt: Date.now() },
        });

        if (!user)
            throw createError(400, "Invalid or expired verification code");

        user.isVerified = true;
        user.verificationToken = undefined;
        user.verificationTokenExpiresAt = undefined;
        await user.save();

        await sendWelcomeEmail(user.email, user.name);

        res.status(200).json({
            success: true,
            message: "Email verified successfully",
            user: {
                ...user.toObject(),
                password: undefined,
            },
        });
    } catch (error) {
        next(error);
    }
};

export const login = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { email, password }: LoginBody = req.body;
    try {
        const user = (await User.findOne({ email })) as user;
        if (!user) throw createError(400, "Invalid credentials");

        const isPasswordValid: boolean = await bcryptjs.compare(
            password,
            user.password
        );
        if (!isPasswordValid) throw createError(400, "Invalid credentials");

        generateTokenAndSetCookie(res, user._id.toString());

        user.lastLogin = new Date();
        await user.save();

        res.status(200).json({
            success: true,
            message: "Logged in successfully",
            user: {
                ...user.toObject(),
                password: undefined,
            },
        });
    } catch (error) {
        next(error);
    }
};

export const logout = async (req: Request, res: Response) => {
    res.clearCookie("token");
    res.status(200).json({ success: true, message: "Logged out successfully" });
};

export const forgotPassword = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { email }: ForgotPasswordBody = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) throw createError(400, "User not found");

        // Generate reset token
        const resetToken: string = crypto.randomBytes(20).toString("hex");
        const resetTokenExpiresAt: Date = new Date(
            Date.now() + 1 * 60 * 60 * 1000
        ); // 1 hour

        user.resetPasswordToken = resetToken;
        user.resetPasswordExpiresAt = resetTokenExpiresAt;

        await user.save();

        // send email
        await sendPasswordResetEmail(
            user.email,
            `${process.env.CLIENT_URL}/reset-password/${resetToken}`
        );

        res.status(200).json({
            success: true,
            message: "Password reset link sent to your email",
        });
    } catch (error) {
        next(error);
    }
};

export const resetPassword = async (
    req: Request<ResetPasswordParams>,
    res: Response,
    next: NextFunction
) => {
    try {
        const { token } = req.params;
        const { password }: ResetPasswordBody = req.body;

        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpiresAt: { $gt: Date.now() },
        });

        if (!user) throw createError(400, "Invalid or expired reset token");

        // update password
        const hashedPassword: string = await bcryptjs.hash(password, 10);

        user.password = hashedPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpiresAt = undefined;
        await user.save();

        await sendResetSuccessEmail(user.email);

        res.status(200).json({
            success: true,
            message: "Password reset successful",
        });
    } catch (error) {
        next(error);
    }
};

export const checkAuth = async (
    req: RequestWithUserId,
    res: Response,
    next: NextFunction
) => {
    try {
        const user = await User.findById(req.userId).select("-password");
        if (!user) throw createError(400, "User not found");

        res.status(200).json({ success: true, user });
    } catch (error) {
        next(error);
    }
};
