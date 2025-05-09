import React from "react";

import { LogOut } from "lucide-react";

import { useAuthStore } from "@/store/authStore";

import { Button } from "@/components/ui/button";
import Search from "@/components/Search";
import FileUploader from "@/components/FileUploader";

import { SFile } from "@/types";

interface HeaderProps {
    accountId: string | undefined;
    folderPath: string;
    files: SFile[];
}

const Header: React.FC<HeaderProps> = ({ accountId, folderPath, files }) => {
    const { logout } = useAuthStore();

    const handleLogout = async (e: React.FormEvent) => {
        e.preventDefault();
        await logout();
    };

    return (
        <header className="header">
            <Search files={files} />
            <div className="header-wrapper">
                <FileUploader folderPath={folderPath} accountId={accountId} />
                <form onSubmit={handleLogout}>
                    <Button type="submit" className="sign-out-button">
                        <LogOut size={24} className="w-6" aria-label="Logout" />
                    </Button>
                </form>
            </div>
        </header>
    );
};

export default Header;
