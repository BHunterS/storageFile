import { Link, useLocation } from "react-router-dom";

import { cn } from "@/lib/utils";

import {
    Home,
    FileText,
    Image,
    Video,
    Folder,
    Trash2,
    Heart,
} from "lucide-react";

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

const Sidebar = () => {
    const location = useLocation();

    return (
        <aside className="sidebar">
            <Link to="/">
                <img
                    src="/assets/icons/logo-full-brand.svg"
                    alt="logo"
                    width={160}
                    height={50}
                    className="hidden h-auto lg:block"
                />
                <img
                    src="/assets/icons/logo-brand.svg"
                    alt="logo"
                    width={52}
                    height={52}
                    className="lg:hidden"
                />
            </Link>

            <nav className="sidebar-nav">
                <ul className="flex flex-1 flex-col gap-6">
                    {navItems.map(({ url, name, icon }) => {
                        const isActive =
                            url === "/"
                                ? location.pathname === "/" ||
                                  !navItems.some(
                                      (item) =>
                                          location.pathname.startsWith(
                                              item.url
                                          ) && item.url !== "/"
                                  )
                                : location.pathname.startsWith(url);
                        return (
                            <Link key={name} to={url} className="lg:w-full">
                                <li
                                    className={cn(
                                        "sidebar-nav-item",
                                        isActive && "shad-active"
                                    )}
                                >
                                    {icon}
                                    <p className="hidden lg:block">{name}</p>
                                </li>
                            </Link>
                        );
                    })}
                </ul>
            </nav>
        </aside>
    );
};

export default Sidebar;
