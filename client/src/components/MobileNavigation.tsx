import { useState } from "react";
import { Link, useLocation } from "react-router-dom";

import {
    Home,
    FileText,
    Image,
    Video,
    Folder,
    Trash2,
    Heart,
    Menu,
    LogOut,
} from "lucide-react";

import { cn } from "@/lib/utils";

import { useAuthStore } from "@/store/authStore";

import {
    Sheet,
    SheetTrigger,
    SheetContent,
    SheetTitle,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

import FileUploader from "./FileUploader";
import { User } from "@/types";

const navItems = [
    {
        name: "Dashboard",
        icon: <Home />,
        url: "/",
    },
    {
        name: "Documents",
        icon: <FileText />,
        url: "/documents",
    },
    {
        name: "Images",
        icon: <Image />,
        url: "/images",
    },
    {
        name: "Media",
        icon: <Video />,
        url: "/media",
    },
    {
        name: "Others",
        icon: <Folder />,
        url: "/other",
    },
    {
        name: "Trash",
        icon: <Trash2 />,
        url: "/trash",
    },
    {
        name: "Favorite",
        icon: <Heart />,
        url: "/favorite",
    },
];

interface Props {
    user: User | null;
    folderPath: string;
}

const MobileNavigation = ({ folderPath, user }: Props) => {
    const [open, setOpen] = useState(false);
    const location = useLocation();
    const pathname = location.pathname;

    const { logout } = useAuthStore();

    return (
        <header className="mobile-header">
            <img
                src="/assets/icons/logo-full-brand.svg"
                alt="logo"
                width={120}
                height={52}
                className="h-auto"
            />

            <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger>
                    <Menu size={30} aria-label="Burger menu" />
                </SheetTrigger>
                <SheetContent className="shad-sheet h-screen px-3">
                    <SheetTitle>
                        <div className="header-user">
                            <img
                                src={user?.avatar}
                                alt="avatar"
                                width={44}
                                height={44}
                                className="header-user-avatar"
                            />
                            <div className="sm:hidden lg:block">
                                <p className="subtitle-2 capitalize">
                                    {user?.name}
                                </p>
                                <p className="caption">{user?.email}</p>
                            </div>
                        </div>
                        <Separator className="mb-4 bg-light-200/20" />
                    </SheetTitle>

                    <nav className="mobile-nav">
                        <ul className="mobile-nav-list">
                            {navItems.map(({ url, name, icon }) => (
                                <Link key={name} to={url} className="lg:w-full">
                                    <li
                                        className={cn(
                                            "mobile-nav-item",
                                            pathname === url && "shad-active"
                                        )}
                                    >
                                        {icon}
                                        <p>{name}</p>
                                    </li>
                                </Link>
                            ))}
                        </ul>
                    </nav>

                    <Separator className="my-5 bg-light-200/20" />

                    <div className="flex flex-col justify-between gap-5 pb-5">
                        <FileUploader
                            folderPath={folderPath}
                            accountId={user?._id}
                        />
                        <Button
                            type="submit"
                            className="mobile-sign-out-button"
                            onClick={async () => await logout()}
                        >
                            <LogOut
                                size={24}
                                className="w-6"
                                aria-label="Logout"
                            />
                            <p>Logout</p>
                        </Button>
                    </div>
                </SheetContent>
            </Sheet>
        </header>
    );
};

export default MobileNavigation;
