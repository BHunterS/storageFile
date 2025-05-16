import { ObjectId } from "mongoose";

export interface CreateSpaceInput {
    name: string;
    description?: string;
    logo?: string;
}

export interface UpdateSpaceInput {
    name?: string;
    description?: string;
    logo?: string;
    isActive?: boolean;
}

export interface AddMemberInput {
    email: string;
    role?: "admin" | "editor" | "viewer";
}

export interface SpaceMember {
    user: string | ObjectId;
    role: "admin" | "editor" | "viewer";
    addedAt: Date;
}
