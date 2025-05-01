import { useState } from "react";
import { Link, useLocation } from "react-router-dom";

import { cn } from "@/lib/utils";

import { useAuthStore } from "@/store/authStore";

import { navItems } from "@/constants";

import {
    Sheet,
    SheetTrigger,
    SheetContent,
    SheetTitle,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

import FileUploader from "./FileUploader";

interface Props {
    accountId?: string;
    name?: string;
    avatar?: string;
    email?: string;
    folderPath: string;
}

const MobileNavigation = ({
    accountId,
    name,
    avatar,
    email,
    folderPath,
}: Props) => {
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
                    <img
                        src="/assets/icons/menu.svg"
                        alt="Search"
                        width={30}
                        height={30}
                    />
                </SheetTrigger>
                <SheetContent className="shad-sheet h-screen px-3">
                    <SheetTitle>
                        <div className="header-user">
                            <img
                                src={avatar}
                                alt="avatar"
                                width={44}
                                height={44}
                                className="header-user-avatar"
                            />
                            <div className="sm:hidden lg:block">
                                <p className="subtitle-2 capitalize">{name}</p>
                                <p className="caption">{email}</p>
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
                                        <img
                                            src={icon}
                                            alt={name}
                                            width={24}
                                            height={24}
                                            className={cn(
                                                "nav-icon",
                                                pathname === url &&
                                                    "nav-icon-active"
                                            )}
                                        />
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
                            accountId={accountId}
                        />
                        <Button
                            type="submit"
                            className="mobile-sign-out-button"
                            onClick={async () => await logout()}
                        >
                            <img
                                src="/assets/icons/logout.svg"
                                alt="logo"
                                width={24}
                                height={24}
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
