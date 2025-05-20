import { Link } from "react-router-dom";

import { LogOut, User, History, Workflow } from "lucide-react";

import { useAuthStore } from "@/store/authStore";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
    DropdownMenuItem,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface UserMenuProps {
    name?: string;
    email?: string;
    avatar?: string;
}

const UserMenu: React.FC<UserMenuProps> = ({ name, email, avatar }) => {
    const { logout } = useAuthStore();

    const handleLogout = async (e: React.FormEvent) => {
        e.preventDefault();
        await logout();
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="rounded-full p-0 w-16 h-16">
                    <img
                        src={avatar}
                        alt="User avatar"
                        className="rounded-full object-cover w-full h-full"
                    />
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-64 p-2">
                <div className="flex items-center space-x-3 px-2 py-2">
                    <img
                        src={avatar}
                        alt="avatar"
                        width={44}
                        height={44}
                        className="rounded-full"
                    />
                    <div>
                        <p className="font-medium capitalize">{name}</p>
                        <p className="text-sm text-muted-foreground">{email}</p>
                    </div>
                </div>

                <DropdownMenuSeparator />

                <DropdownMenuItem className="cursor-pointer px-3 py-2 text-sm font-medium hover:bg-muted transition-colors rounded-md">
                    <Link
                        to="/profile"
                        className="w-full h-full flex items-center"
                    >
                        <User className="w-5 h-5 mr-2 text-muted-foreground" />
                        <span className="text-base text-foreground">
                            My profile
                        </span>
                    </Link>
                </DropdownMenuItem>

                <DropdownMenuItem className="cursor-pointer px-3 py-2 text-sm font-medium hover:bg-muted transition-colors rounded-md">
                    <Link
                        to="/actions"
                        className="w-full h-full flex items-center"
                    >
                        <History className="w-5 h-5 mr-2 text-muted-foreground" />
                        <span className="text-base text-foreground">
                            My actions
                        </span>
                    </Link>
                </DropdownMenuItem>

                <DropdownMenuItem className="cursor-pointer px-3 py-2 text-sm font-medium hover:bg-muted transition-colors rounded-md">
                    <Link
                        to="/spaces"
                        className="w-full h-full flex items-center"
                    >
                        <Workflow className="w-5 h-5 mr-2 text-muted-foreground" />
                        <span className="text-base text-foreground">
                            Manage spaces
                        </span>
                    </Link>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <form onSubmit={handleLogout}>
                    <DropdownMenuItem asChild>
                        <Button
                            type="submit"
                            variant="ghost"
                            className="w-full justify-start cursor-pointer px-3 py-2 text-sm font-medium hover:bg-muted transition-colors rounded-md"
                        >
                            <LogOut className="w-5 h-5 mr-2 text-muted-foreground" />
                            <span className="text-base text-foreground">
                                Logout
                            </span>
                        </Button>
                    </DropdownMenuItem>
                </form>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default UserMenu;
