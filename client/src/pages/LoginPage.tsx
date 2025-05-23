import { useState, FormEvent } from "react";
import { Link } from "react-router-dom";
import { Mail, Lock, Loader } from "lucide-react";

import { motion } from "framer-motion";

import { useAuthStore } from "../store/authStore";

import Input from "@/components/auth/Input";

const LoginPage: React.FC = () => {
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");

    const { login, isLoading, error } = useAuthStore();

    const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        await login(email, password);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-md w-full bg-brand-900 bg-opacity-50 backdrop-filter backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden"
        >
            <div className="p-8">
                <h2 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-brand-100 to-brand text-transparent bg-clip-text">
                    Welcome Back
                </h2>

                <form onSubmit={handleLogin}>
                    <Input
                        icon={Mail}
                        type="email"
                        placeholder="Email Address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />

                    <Input
                        icon={Lock}
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />

                    <div className="flex items-center mb-6">
                        <Link
                            to="/forgot-password"
                            className="text-sm text-brand-400 hover:underline"
                        >
                            Forgot password?
                        </Link>
                    </div>
                    {error && (
                        <p className="text-red-500 font-semibold mb-2">
                            {error}
                        </p>
                    )}

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full py-3 px-4 bg-gradient-to-r from-brand-500 to-brand-600 text-white font-bold rounded-lg shadow-lg hover:from-brand-300 hover:to-brand-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 focus:ring-offset-brand-900 transition duration-200"
                        type="submit"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <Loader className="w-6 h-6 animate-spin  mx-auto" />
                        ) : (
                            "Login"
                        )}
                    </motion.button>
                </form>
            </div>
            <div className="px-8 py-4 bg-brand-900 bg-opacity-50 flex justify-center">
                <p className="text-sm text-brand-400">
                    Don't have an account?{" "}
                    <Link
                        to="/signup"
                        className="text-brand-400 hover:underline"
                    >
                        Sign up
                    </Link>
                </p>
            </div>
        </motion.div>
    );
};

export default LoginPage;
