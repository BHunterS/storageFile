// src/components/Breadcrumb.tsx
import React from "react";

interface BreadcrumbProps {
    path: string;
    onNavigate: (path: string) => void;
    onNavigateUp: () => void;
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({
    path,
    onNavigate,
    onNavigateUp,
}) => {
    const pathParts = path.split("/").filter((part) => part !== "");

    const handleClick = (index: number) => {
        if (index === -1) {
            onNavigate("/");
        } else {
            const newPath = "/" + pathParts.slice(0, index + 1).join("/");
            onNavigate(newPath);
        }
    };

    return (
        <div className="flex gap-4">
            <button onClick={onNavigateUp} className="up-button">
                ↑ Up
            </button>

            <div className="breadcrumb-path">
                <span
                    className="breadcrumb-item clickable"
                    onClick={() => handleClick(-1)}
                >
                    Main
                </span>

                {pathParts.map((part, index) => (
                    <React.Fragment key={index}>
                        <span className="breadcrumb-separator">/</span>
                        <span
                            className="breadcrumb-item clickable"
                            onClick={() => handleClick(index)}
                        >
                            {part}
                        </span>
                    </React.Fragment>
                ))}
            </div>
        </div>
    );
};

export default Breadcrumb;
