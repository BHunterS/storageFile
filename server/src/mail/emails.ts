import nodemailer, { Transporter } from "nodemailer";
import dotenv from "dotenv";

import { createError } from "../utils/createError";

import {
    PASSWORD_RESET_REQUEST_TEMPLATE,
    PASSWORD_RESET_SUCCESS_TEMPLATE,
    VERIFICATION_EMAIL_TEMPLATE,
} from "./emailTemplates";

dotenv.config();

interface EmailService {
    sendVerificationEmail: (
        email: string,
        verificationToken: string
    ) => Promise<void>;
    sendWelcomeEmail: (email: string, name: string) => Promise<void>;
    sendPasswordResetEmail: (email: string, resetURL: string) => Promise<void>;
    sendResetSuccessEmail: (email: string) => Promise<void>;
}

const transporter: Transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
    debug: true,
    logger: true,
});

export const sendVerificationEmail: EmailService["sendVerificationEmail"] =
    async (email, verificationToken) => {
        try {
            await transporter.sendMail({
                to: email,
                subject: "Verify your email",
                html: VERIFICATION_EMAIL_TEMPLATE.replace(
                    "{verificationCode}",
                    verificationToken
                ),
            });
        } catch {
            throw createError(400, "Error sending verification email");
        }
    };

export const sendWelcomeEmail: EmailService["sendWelcomeEmail"] = async (
    email,
    name
) => {
    try {
        await transporter.sendMail({
            to: email,
            subject: "Welcome to fileStorage",
            html: `<p>Hello ${name}, welcome to storageFile Company!</p>`,
        });
    } catch {
        throw createError(400, "Error sending welcome email");
    }
};

export const sendPasswordResetEmail: EmailService["sendPasswordResetEmail"] =
    async (email, resetURL) => {
        try {
            await transporter.sendMail({
                to: email,
                subject: "Reset your password",
                html: PASSWORD_RESET_REQUEST_TEMPLATE.replace(
                    "{resetURL}",
                    resetURL
                ),
            });
        } catch {
            throw createError(400, "Error sending password reset email");
        }
    };

export const sendResetSuccessEmail: EmailService["sendResetSuccessEmail"] =
    async (email) => {
        try {
            await transporter.sendMail({
                to: email,
                subject: "Password Reset Successful",
                html: PASSWORD_RESET_SUCCESS_TEMPLATE,
            });
        } catch (error: any) {
            throw createError(
                400,
                "Error sending password reset success email"
            );
        }
    };
