import nodemailer, { Transporter } from "nodemailer";
import dotenv from "dotenv";
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
            const info = await transporter.sendMail({
                to: email,
                subject: "Verify your email",
                html: VERIFICATION_EMAIL_TEMPLATE.replace(
                    "{verificationCode}",
                    verificationToken
                ),
            });
            console.log("Verification email sent successfully", info);
        } catch (error: any) {
            console.error("Error sending verification email", error);
            throw new Error(
                `Error sending verification email: ${error.message}`
            );
        }
    };

export const sendWelcomeEmail: EmailService["sendWelcomeEmail"] = async (
    email,
    name
) => {
    try {
        const info = await transporter.sendMail({
            to: email,
            subject: "Welcome to fileStorage",
            html: `<p>Hello ${name}, welcome to storageFile Company!</p>`,
        });
        console.log("Welcome email sent successfully", info);
    } catch (error: any) {
        console.error("Error sending welcome email", error);
        throw new Error(`Error sending welcome email: ${error.message}`);
    }
};

export const sendPasswordResetEmail: EmailService["sendPasswordResetEmail"] =
    async (email, resetURL) => {
        try {
            const info = await transporter.sendMail({
                to: email,
                subject: "Reset your password",
                html: PASSWORD_RESET_REQUEST_TEMPLATE.replace(
                    "{resetURL}",
                    resetURL
                ),
            });
            console.log("Password reset email sent successfully", info);
        } catch (error: any) {
            console.error("Error sending password reset email", error);
            throw new Error(
                `Error sending password reset email: ${error.message}`
            );
        }
    };

export const sendResetSuccessEmail: EmailService["sendResetSuccessEmail"] =
    async (email) => {
        try {
            const info = await transporter.sendMail({
                to: email,
                subject: "Password Reset Successful",
                html: PASSWORD_RESET_SUCCESS_TEMPLATE,
            });
            console.log("Password reset success email sent successfully", info);
        } catch (error: any) {
            console.error("Error sending password reset success email", error);
            throw new Error(
                `Error sending password reset success email: ${error.message}`
            );
        }
    };
