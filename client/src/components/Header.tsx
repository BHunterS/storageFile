import React from "react";

import Search from "@/components/Search";
import FileUploader from "@/components/FileUploader";
import UserMenu from "@/components/UserMenu";

import { SFile, User } from "@/types";

interface HeaderProps {
    accountId: string | undefined;
    folderPath: string;
    files: SFile[];
    user: User | null;
}

const Header: React.FC<HeaderProps> = ({
    accountId,
    folderPath,
    files,
    user,
}) => {
    return (
        <header className="header">
            <Search files={files} />
            <div className="header-wrapper">
                <FileUploader folderPath={folderPath} accountId={accountId} />
                <UserMenu {...user} />
            </div>
        </header>
    );
};

export default Header;
