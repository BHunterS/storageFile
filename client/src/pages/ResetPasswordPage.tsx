import { useState, FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { Lock } from "lucide-react";

import { motion } from "framer-motion";

import { useAuthStore } from "../store/authStore";

import Input from "@/components/auth/Input";

const ResetPasswordPage: React.FC = () => {
    const [password, setPassword] = useState<string>("");
    const [confirmPassword, setConfirmPassword] = useState<string>("");
    const { resetPassword, error, isLoading, message } = useAuthStore();

    const { token } = useParams<{ token: string }>();
    const navigate = useNavigate();

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            alert("Passwords do not match");
            return;
        }
        try {
            if (token) {
                await resetPassword(token, password);
            }

            toast.success(
                "Password reset successfully, redirecting to login page..."
            );
            setTimeout(() => {
                navigate("/login");
            }, 2000);
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || "Error resetting password");
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-md w-full bg-brand-800 bg-opacity-50 backdrop-filter backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden"
        >
            <div className="p-8">
                <h2 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-brand-400 to-brand-500 text-transparent bg-clip-text">
                    Reset Password
                </h2>
                {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
                {message && (
                    <p className="text-brand-500 text-sm mb-4">{message}</p>
                )}

                <form onSubmit={handleSubmit}>
                    <Input
                        icon={Lock}
                        type="password"
                        placeholder="New Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />

                    <Input
                        icon={Lock}
                        type="password"
                        placeholder="Confirm New Password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                    />

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full py-3 px-4 bg-gradient-to-r from-brand-500 to-brand-600 text-white font-bold rounded-lg shadow-lg hover:from-brand-600 hover:to-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 focus:ring-offset-brand-900 transition duration-200"
                        type="submit"
                        disabled={isLoading}
                    >
                        {isLoading ? "Resetting..." : "Set New Password"}
                    </motion.button>
                </form>
            </div>
        </motion.div>
    );
};

export default ResetPasswordPage;
