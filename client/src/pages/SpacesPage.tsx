import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp, Inbox, Users, X } from "lucide-react";

import { getMySpaces, removeMember, deleteSpace } from "@/api/space";
import { useUploadStore } from "@/store/uploadStore";
import { formatDateTime } from "@/utils/helpers";

import CreateSpaceButton from "@/components/CreateSpaceButton";
import SpaceActions from "@/components/SpaceActions";
import MemberActions from "@/components/MemberActions";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

import { Space, User } from "@/types";

const SpacesPage = () => {
    const [spaces, setSpaces] = useState<Space[]>([]);
    const [expandedSpaceId, setExpandedSpaceId] = useState<string | null>(null);
    const { trigger } = useUploadStore();

    const handleRemoveMember = async (spaceId: string, memberId: string) => {
        await removeMember(spaceId, memberId);

        setSpaces((prev) =>
            prev.map((space) =>
                space._id === spaceId
                    ? {
                          ...space,
                          members: space.members.filter(
                              (m) =>
                                  (typeof m.user === "string"
                                      ? m.user
                                      : m.user._id) !== memberId
                          ),
                      }
                    : space
            )
        );
    };

    const handleDeleteSpace = async (spaceId: string) => {
        await deleteSpace(spaceId);

        setSpaces((prev) => prev.filter((s) => s._id !== spaceId));
    };

    const toggleExpand = (spaceId: string) => {
        setExpandedSpaceId((prev) => (prev === spaceId ? null : spaceId));
    };

    useEffect(() => {
        const fetchSpaces = async () => {
            try {
                const response = await getMySpaces();
                setSpaces(response.spaces || []);
            } catch (err) {
                console.error("Error fetching spaces:", err);
            }
        };

        fetchSpaces();
    }, [trigger]);

    return (
        <div className="w-full h-full flex-1 p-4">
            <Card className="h-full overflow-y-auto">
                <CardHeader className="flex flex-row w-full justify-between">
                    <CardTitle className="text-lg font-semibold">
                        <span>My Spaces</span>
                    </CardTitle>
                    <CreateSpaceButton />
                </CardHeader>

                <CardContent>
                    {spaces.length === 0 ? (
                        <div className="flex flex-col items-center justify-center text-center text-muted-foreground h-64">
                            <Inbox className="w-10 h-10 mb-2" />
                            <p className="text-sm font-medium">No spaces yet</p>
                            <p className="text-xs">
                                You are not a member of any space
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {spaces.map((space) => {
                                const owner =
                                    typeof space.owner === "string"
                                        ? "Unknown"
                                        : (space.owner as User).name;

                                const members = space.members || [];
                                const isExpanded =
                                    expandedSpaceId === space._id;
                                const createdAt = formatDateTime(
                                    space.createdAt
                                );

                                return (
                                    <Card
                                        key={space._id}
                                        className="w-full p-4 cursor-pointer"
                                        onClick={() => toggleExpand(space._id)}
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex items-center gap-3">
                                                <Avatar>
                                                    <AvatarImage
                                                        src={space.logo}
                                                    />
                                                    <AvatarFallback>
                                                        CN
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-medium">
                                                        {space.name}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground">
                                                        Owner: {owner} ·{" "}
                                                        {members.length} member
                                                        {members.length !== 1
                                                            ? "s"
                                                            : ""}{" "}
                                                        · Created: {createdAt}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                {/* Action buttons (do NOT propagate click) */}
                                                <SpaceActions
                                                    space={space}
                                                    handleDeleteSpace={
                                                        handleDeleteSpace
                                                    }
                                                />

                                                {/* Chevron toggle (propagates click to toggleExpand) */}
                                                {isExpanded ? (
                                                    <ChevronUp className="w-6 h-6 text-muted-foreground" />
                                                ) : (
                                                    <ChevronDown className="w-6 h-6 text-muted-foreground" />
                                                )}
                                            </div>
                                        </div>

                                        {isExpanded && members.length > 0 && (
                                            <div className="mt-4 space-y-2 pl-8 border-l border-muted">
                                                {members.map((member, idx) => {
                                                    const user =
                                                        member.user as User;
                                                    return (
                                                        <div
                                                            key={idx}
                                                            className="flex items-center justify-between text-sm"
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <Users className="w-6 h-6 text-muted-foreground" />
                                                                <div className="flex flex-col">
                                                                    <span className="font-medium">
                                                                        {
                                                                            user.name
                                                                        }
                                                                    </span>
                                                                    <span className="text-xs text-muted-foreground">
                                                                        {
                                                                            user.email
                                                                        }{" "}
                                                                        · Role:{" "}
                                                                        {
                                                                            member.role
                                                                        }
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <MemberActions
                                                                spaceId={
                                                                    space._id
                                                                }
                                                            />
                                                            <button
                                                                className="p-1 rounded hover:bg-muted"
                                                                onClick={(
                                                                    e
                                                                ) => {
                                                                    e.stopPropagation();
                                                                    handleRemoveMember(
                                                                        space._id,
                                                                        typeof member.user ===
                                                                            "string"
                                                                            ? member.user
                                                                            : member
                                                                                  .user
                                                                                  ._id
                                                                    );
                                                                }}
                                                                title="Remove member"
                                                            >
                                                                <X className="w-6 h-6 text-muted-foreground" />
                                                            </button>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </Card>
                                );
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default SpacesPage;
