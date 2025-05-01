import React from "react";

import { useAuthStore } from "@/store/authStore";

import { Button } from "@/components/ui/button";
import Search from "@/components/Search";
import FileUploader from "@/components/FileUploader";

interface HeaderProps {
    accountId: string | undefined;
    folderPath: string;
}

const Header: React.FC<HeaderProps> = ({ accountId, folderPath }) => {
    const { logout } = useAuthStore();

    const handleLogout = async (e: React.FormEvent) => {
        e.preventDefault();
        await logout();
    };

    return (
        <header className="header">
            <Search />
            <div className="header-wrapper">
                <FileUploader folderPath={folderPath} accountId={accountId} />
                <form onSubmit={handleLogout}>
                    <Button type="submit" className="sign-out-button">
                        <img
                            src="/assets/icons/logout.svg"
                            alt="logout"
                            width={24}
                            height={24}
                            className="w-6"
                        />
                    </Button>
                </form>
            </div>
        </header>
    );
};

export default Header;
