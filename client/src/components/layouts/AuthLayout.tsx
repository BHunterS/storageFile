import { Outlet } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import FloatingShape from "../auth/FloatingShape";

const AuthLayout = () => {
    return (
        <div
            className="min-h-screen bg-gradient-to-br
    from-brand-900 via-brand-900 to-brand-900 flex items-center justify-center relative overflow-hidden"
        >
            <FloatingShape
                color="bg-brand-500"
                size="w-64 h-64"
                top="-5%"
                left="10%"
                delay={0}
            />
            <FloatingShape
                color="bg-brand-500"
                size="w-48 h-48"
                top="70%"
                left="80%"
                delay={5}
            />
            <FloatingShape
                color="bg-brand-500"
                size="w-32 h-32"
                top="40%"
                left="-10%"
                delay={2}
            />
            <Outlet />
            <Toaster />
        </div>
    );
};

export default AuthLayout;
