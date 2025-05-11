import { ReactNode } from "react";

import { useAuthStore } from "@/store/authStore";
import { useStorageStore } from "@/store/storageStore";

import Sidebar from "@/components/Sidebar";
import MobileNavigation from "@/components/MobileNavigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const MainLayout = ({ children }: { children: ReactNode }) => {
    const { user } = useAuthStore();
    const { currentFolder, files } = useStorageStore();

    return (
        <div className="flex h-screen">
            <Sidebar />
            <main className="flex flex-1 flex-col">
                <MobileNavigation user={user} folderPath={currentFolder} />
                <Header user={user} folderPath={currentFolder} files={files} />
                <div className="flex-1 overflow-auto">{children}</div>
                <Footer />
            </main>
        </div>
    );
};

export default MainLayout;
