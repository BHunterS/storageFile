import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";

// Типізація пропсів для компонента
interface RedirectAuthenticatedUserProps {
    children: React.ReactNode;
}

const RedirectAuthenticatedUser: React.FC<RedirectAuthenticatedUserProps> = ({
    children,
}) => {
    const { isAuthenticated, user } = useAuthStore();

    if (isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    return children;
};

export default RedirectAuthenticatedUser;
