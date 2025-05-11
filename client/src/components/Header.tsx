import React from "react";

import Search from "@/components/Search";
import FileUploader from "@/components/FileUploader";
import UserMenu from "@/components/UserMenu";

import { SFile, User } from "@/types";

interface HeaderProps {
    folderPath: string;
    files: SFile[];
    user: User | null;
}

const Header: React.FC<HeaderProps> = ({ folderPath, files, user }) => {
    return (
        <header className="header">
            <Search files={files} />
            <div className="header-wrapper">
                {folderPath && (
                    <FileUploader
                        folderPath={folderPath}
                        accountId={user?._id}
                    />
                )}
                <UserMenu {...user} />
            </div>
        </header>
    );
};

export default Header;
