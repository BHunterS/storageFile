import { LucideIcon } from "lucide-react";
import { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    icon: LucideIcon;
}

const Input: React.FC<InputProps> = ({ icon: Icon, ...props }) => {
    return (
        <div className="relative mb-6">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Icon className="w-5 h-5 text-brand-500" />
            </div>
            <input
                {...props}
                className="w-full pl-10 pr-3 py-2 bg-brand-800 bg-opacity-50 rounded-lg border border-brand-700 focus:border-brand-500 focus:ring-2 focus:ring-brand-500 text-white placeholder-brand-400 transition duration-200"
            />
        </div>
    );
};

export default Input;
