import mongoose from "mongoose";

import Space from "../models/space.model";
import User from "../models/user.model";

import { createError } from "../utils/createError";

import { ISpace } from "../types";
import {
    CreateSpaceInput,
    UpdateSpaceInput,
    AddMemberInput,
} from "../types/space";

export const createSpace = async (
    input: CreateSpaceInput,
    ownerId: string
): Promise<ISpace> => {
    try {
        const owner = await User.findById(ownerId);
        if (!owner) throw createError(404, "Owner not found");

        const space = new Space({
            name: input.name,
            description: input.description || "",
            owner: ownerId,
            logo: input.logo || "",
            members: [
                {
                    user: ownerId,
                    role: "admin",
                    addedAt: new Date(),
                },
            ],
        });

        await space.save();
        return space;
    } catch (error) {
        throw error;
    }
};

export const getSpaceById = async (spaceId: string): Promise<ISpace | null> => {
    try {
        return await Space.findById(spaceId)
            .populate("owner", "name email avatar")
            .populate("members.user", "name email avatar");
    } catch (error) {
        throw error;
    }
};

export const getUserSpaces = async (userId: string): Promise<ISpace[]> => {
    try {
        return await Space.find({
            "members.user": userId,
            isActive: true,
        })
            .populate("owner", "name email avatar")
            .populate("members.user", "name email avatar")
            .sort({ createdAt: -1 });
    } catch (error) {
        throw error;
    }
};

export const updateSpace = async (
    spaceId: string,
    userId: string,
    input: UpdateSpaceInput
): Promise<ISpace | null> => {
    try {
        // Check if the user has permission to update this space
        const space = await Space.findOne({
            _id: spaceId,
            members: { $elemMatch: { user: userId, role: "admin" } },
        });

        if (!space) {
            throw createError(
                404,
                "Space not found or you don't have permission to update it"
            );
        }

        // Update space fields
        const updateData: any = {};
        if (input.name) updateData.name = input.name;
        if (input.description !== undefined)
            updateData.description = input.description;
        if (input.logo) updateData.logo = input.logo;
        if (input.isActive !== undefined) updateData.isActive = input.isActive;

        const updatedSpace = await Space.findByIdAndUpdate(
            spaceId,
            { $set: updateData },
            { new: true }
        )
            .populate("owner", "name email avatar")
            .populate("members.user", "name email avatar");

        return updatedSpace;
    } catch (error) {
        throw error;
    }
};

export const addMember = async (
    spaceId: string,
    adminId: string,
    input: AddMemberInput
): Promise<ISpace | null> => {
    try {
        // Check if the user has permission to update this space
        const space = await Space.findOne({
            _id: spaceId,
            members: { $elemMatch: { user: adminId, role: "admin" } },
        });

        if (!space) {
            throw createError(
                404,
                "Space not found or you don't have permission to add members"
            );
        }

        const user = await User.findOne({ email: input.email });
        if (!user) throw createError(404, "User not found");

        // Check if user is already a member
        const isMember = space.members.some(
            (member) =>
                member.user.toString() ===
                (user._id as mongoose.Types.ObjectId).toString()
        );

        if (isMember) {
            return await Space.findById(spaceId)
                .populate("owner", "name email avatar")
                .populate("members.user", "name email avatar");
        }

        // Add the new member
        const updatedSpace = await Space.findByIdAndUpdate(
            spaceId,
            {
                $push: {
                    members: {
                        user: user._id,
                        role: input.role || "viewer",
                        addedAt: new Date(),
                    },
                },
            },
            { new: true }
        )
            .populate("owner", "name email avatar")
            .populate("members.user", "name email avatar");

        return updatedSpace;
    } catch (error) {
        throw error;
    }
};

export const updateMemberRole = async (
    spaceId: string,
    adminId: string,
    memberId: string,
    role: "admin" | "editor" | "viewer"
): Promise<ISpace | null> => {
    try {
        // Check if the user has permission to update this space
        const space = await Space.findOne({
            _id: spaceId,
            members: { $elemMatch: { user: adminId, role: "admin" } },
        });

        if (!space) {
            throw createError(
                404,
                "Space not found or you don't have permission to update member roles"
            );
        }

        // Prevent changing the owner's role
        if (space.owner.toString() === memberId) {
            throw createError(400, "Cannot change the owner's role");
        }

        // Update the member's role
        const updatedSpace = await Space.findOneAndUpdate(
            {
                _id: spaceId,
                "members.user": memberId,
            },
            {
                $set: { "members.$.role": role },
            },
            { new: true }
        )
            .populate("owner", "name email avatar")
            .populate("members.user", "name email avatar");

        return updatedSpace;
    } catch (error) {
        throw error;
    }
};

export const removeMember = async (
    spaceId: string,
    adminId: string,
    memberId: string
): Promise<ISpace | null> => {
    try {
        // Check if the admin has permission to remove members
        const space = await Space.findOne({
            _id: spaceId,
            members: { $elemMatch: { user: adminId, role: "admin" } },
        });

        if (!space) {
            throw createError(
                404,
                "Space not found or you don't have permission to remove members"
            );
        }

        // Prevent removing the owner
        if (space.owner.toString() === memberId) {
            throw createError(400, "Cannot remove the owner from the space");
        }

        // Remove the member
        const updatedSpace = await Space.findByIdAndUpdate(
            spaceId,
            {
                $pull: { members: { user: memberId } },
            },
            { new: true }
        )
            .populate("owner", "name email avatar")
            .populate("members.user", "name email avatar");

        return updatedSpace;
    } catch (error) {
        throw error;
    }
};

export const deleteSpace = async (
    spaceId: string,
    userId: string
): Promise<boolean> => {
    try {
        // Only the owner can delete a space
        const space = await Space.findOne({
            _id: spaceId,
            owner: userId,
        });

        if (!space) {
            throw createError(404, "Space not found or you are not the owner");
        }

        // Instead of hard deleting, we mark it as inactive
        await Space.findByIdAndUpdate(spaceId, { isActive: false });

        return true;
    } catch (error) {
        throw error;
    }
};

export const checkSpaceAccess = async (
    spaceId: string,
    userId: string
): Promise<{ hasAccess: boolean; hasEditAccess: boolean; role?: string }> => {
    try {
        if (!mongoose.Types.ObjectId.isValid(spaceId)) {
            throw createError(400, "Invalid space id");
        }

        const space = await Space.findOne({
            _id: spaceId,
            $or: [
                { owner: userId },
                { members: { $elemMatch: { user: userId } } },
            ],
            isActive: true,
        });

        if (!space) {
            return { hasAccess: false, hasEditAccess: false };
        }

        // Determine the user's role
        let role = "viewer";
        if (space.owner.toString() === userId) {
            role = "admin";
        } else {
            const member = space.members.find(
                (m) => m.user.toString() === userId
            );
            if (member) {
                role = member.role;
            }
        }

        const hasEditAccess = role === "admin" || role === "editor";

        return { hasAccess: true, hasEditAccess, role };
    } catch (error) {
        throw error;
    }
};
