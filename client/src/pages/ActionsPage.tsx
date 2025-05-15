import { JSX, useEffect, useState } from "react";
import {
    File as FileIcon,
    Folder as FolderIcon,
    Trash2,
    Download,
    Upload,
    Pencil,
    Move,
    Star,
    RotateCw,
    Inbox,
    FolderPlus,
} from "lucide-react";

import { getLogs } from "@/api/log";
import { useUploadStore } from "@/store/uploadStore";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

import { Log } from "@/types";
import { formatDateTime } from "@/utils/helpers";

const createLogMessageComponent = (log: Log): JSX.Element => {
    const { action, targetType, targetName, targetMessage, createdAt } = log;

    const Icon = targetType === "file" ? FileIcon : FolderIcon;
    const formattedTime = formatDateTime(createdAt);
    let message: string = "";
    let ActionIcon = Icon;

    switch (action) {
        case "upload":
            message = `Uploaded ${targetType} "${targetName}"`;
            ActionIcon = Upload;
            break;
        case "delete":
            message = `Deleted ${targetType} "${targetName}" - ${targetMessage}`;
            ActionIcon = Trash2;
            break;
        case "restore":
            message = `Restored ${targetType} "${targetName}"`;
            ActionIcon = RotateCw;
            break;
        case "download":
            message = `Downloaded ${targetType} "${targetName}"`;
            ActionIcon = Download;
            break;
        case "rename":
            message = `Renamed ${targetType} "${targetName}" → "${targetMessage}"`;
            ActionIcon = Pencil;
            break;
        case "move":
            message = `Moved ${targetType} "${targetName}" to "${targetMessage}"`;
            ActionIcon = Move;
            break;
        case "favorite":
            message = `${targetType} "${targetName}" ${targetMessage} favorite`;
            ActionIcon = Star;
            break;
        case "create":
            message = `Created ${targetType} "${targetName}" in ${targetMessage}`;
            ActionIcon = FolderPlus;
            break;
        default:
            message = `Performed ${action} on ${targetType} "${targetName}"`;
    }

    return (
        <Card className="w-full flex items-center gap-4 p-4">
            <ActionIcon className="w-5 h-5 text-muted-foreground" />
            <div className="flex flex-col">
                <span className="text-sm font-medium">{message}</span>
                <span className="text-xs text-muted-foreground">
                    {formattedTime}
                </span>
            </div>
        </Card>
    );
};

const ActionsPage = () => {
    const [logs, setLogs] = useState<Log[]>([]);
    const { trigger } = useUploadStore();

    useEffect(() => {
        const fetchLogs = async () => {
            const response = await getLogs();
            setLogs(response.logs);
        };

        fetchLogs();
    }, [trigger]);

    return (
        <div className="w-full h-full flex-1 p-4">
            <Card className="h-full overflow-y-auto">
                <CardHeader>
                    <CardTitle className="text-lg font-semibold">
                        My Actions
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {logs.length === 0 ? (
                        <div className="flex flex-col items-center justify-center text-center text-muted-foreground h-64">
                            <Inbox className="w-10 h-10 mb-2" />
                            <p className="text-sm font-medium">
                                No activity yet
                            </p>
                            <p className="text-xs">
                                Your actions will appear here
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {logs.map((log: Log) => (
                                <div key={log._id}>
                                    {createLogMessageComponent(log)}
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default ActionsPage;
