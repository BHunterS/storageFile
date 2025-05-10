import { motion } from "framer-motion";

const LoadingSpinner: React.FC = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-brand-900 via-brand-900 to-brand-900 flex items-center justify-center relative overflow-hidden">
            <motion.div
                className="w-16 h-16 border-4 border-t-4 border-t-brand-500 border-brand-200 rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
        </div>
    );
};

export default LoadingSpinner;
