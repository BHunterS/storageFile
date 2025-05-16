import { BaseResponse, Space } from ".";

export interface BaseSpaceResponse extends BaseResponse {
    space: Space;
}

export interface GetMySpacesResponse extends BaseResponse {
    spaces: Space[];
}

export interface CheckSpaceAccessResponse extends BaseResponse {
    hasAccess: boolean;
    role?: string;
}

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
    user: string;
    role: "admin" | "editor" | "viewer";
    addedAt: Date;
}
