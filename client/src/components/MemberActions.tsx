import React, { useState } from "react";

import { X } from "lucide-react";

import { changeMemberRole } from "@/api/space";

import {
    AlertDialog,
    AlertDialogTrigger,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogCancel,
    AlertDialogAction,
} from "@/components/ui/alert-dialog";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select";

interface Props {
    spaceId: string;
    memberId: string;
    memberName: string;
    memberRole: string;
    handleRemoveMember: (spaceId: string, memberId: string) => void;
}

const roles = ["admin", "editor", "viewer"];

const MemberActions = ({
    spaceId,
    memberId,
    memberName,
    memberRole,
    handleRemoveMember,
}: Props) => {
    const [selectedRole, setSelectedRole] = useState<string>(memberRole);
    const [isChangingRole, setIsChangingRole] = useState(false);

    const handleChangeRole = async (role: string) => {
        try {
            setIsChangingRole(true);
            await changeMemberRole(spaceId, memberId, role);
            setSelectedRole(role);
        } catch (error) {
            console.error("Failed to change role", error);
        } finally {
            setIsChangingRole(false);
        }
    };

    return (
        <div className="flex items-center gap-2">
            <Select
                value={selectedRole}
                onValueChange={handleChangeRole}
                disabled={isChangingRole}
            >
                <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                    {roles.map((role) => (
                        <SelectItem key={role} value={role}>
                            {role}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <button
                        className="p-1 rounded hover:bg-muted"
                        onClick={(e) => {
                            e.stopPropagation();
                        }}
                        title="Remove member"
                    >
                        <X className="w-6 h-6 text-muted-foreground" />
                    </button>
                </AlertDialogTrigger>
                <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action will permanently delete the member from
                            this space <b>{memberName}</b> .
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-destructive hover:bg-destructive/90 text-white"
                            onClick={() =>
                                handleRemoveMember(spaceId, memberId)
                            }
                        >
                            Yes, delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default MemberActions;
