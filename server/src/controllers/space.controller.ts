import { NextFunction, Request, Response } from "express";
import {
    createSpace,
    getSpaceById,
    getUserSpaces,
    updateSpace,
    addMember,
    updateMemberRole,
    removeMember,
    deleteSpace,
    checkSpaceAccess,
} from "../services/space.service";
import {
    CreateSpaceInput,
    UpdateSpaceInput,
    AddMemberInput,
} from "../types/space";
import { createError } from "../utils/createError";
import { RequestWithUserId } from "types";

export const handleCreateSpace = async (
    req: RequestWithUserId,
    res: Response,
    next: NextFunction
) => {
    try {
        const accountId = req.userId!;

        const input: CreateSpaceInput = req.body;
        const space = await createSpace(input, accountId);

        res.status(201).json({
            success: true,
            message: "Space successfully created",
            space,
        });
    } catch (error) {
        next(error);
    }
};

export const handleGetSpaceById = async (
    req: RequestWithUserId,
    res: Response,
    next: NextFunction
) => {
    try {
        const accountId = req.userId!;
        const { spaceId } = req.params;

        // Check if user has access to this space
        const accessCheck = await checkSpaceAccess(spaceId, accountId);
        if (!accessCheck.hasAccess)
            throw createError(403, "You don't have access to this space");

        const space = await getSpaceById(spaceId);
        if (!space) throw createError(404, "Space not found");

        res.status(200).json({
            success: true,
            message: "Space successfully was found",
            space,
        });
    } catch (error) {
        next(error);
    }
};

export const handleGetUserSpaces = async (
    req: RequestWithUserId,
    res: Response,
    next: NextFunction
) => {
    try {
        const accountId = req.userId!;
        const spaces = await getUserSpaces(accountId);

        res.status(200).json({
            success: true,
            message: "Your spaces successfuly found",
            spaces,
        });
    } catch (error) {
        next(error);
    }
};

export const handleUpdateSpace = async (
    req: RequestWithUserId,
    res: Response,
    next: NextFunction
) => {
    try {
        const accountId = req.userId!;
        const { spaceId } = req.params;
        const input: UpdateSpaceInput = req.body;

        const updatedSpace = await updateSpace(spaceId, accountId, input);
        if (!updatedSpace)
            throw createError(
                404,
                "Space not found or you don't have permission to update it"
            );

        res.status(200).json({
            success: true,
            message: "Space updated successfully",
            space: updatedSpace,
        });
    } catch (error) {
        next(error);
    }
};

export const handleAddMember = async (
    req: RequestWithUserId,
    res: Response,
    next: NextFunction
) => {
    try {
        const accountId = req.userId!;
        const { spaceId } = req.params;
        const input: AddMemberInput = req.body;

        const updatedSpace = await addMember(spaceId, accountId, input);

        res.status(200).json({
            success: true,
            message: "Member successfully added",
            space: updatedSpace,
        });
    } catch (error) {
        next(error);
    }
};

export const handleUpdateMemberRole = async (
    req: RequestWithUserId,
    res: Response,
    next: NextFunction
) => {
    try {
        const accountId = req.userId!;
        const { spaceId, memberId } = req.params;
        const { role } = req.body;

        console.log(role);

        if (!role || !["admin", "editor", "viewer"].includes(role))
            throw createError(
                400,
                "Invalid role. Must be 'admin', 'editor', or 'viewer'"
            );

        const updatedSpace = await updateMemberRole(
            spaceId,
            accountId,
            memberId,
            role as "admin" | "editor" | "viewer"
        );

        res.status(200).json({
            success: true,
            message: "Member role successfully updated",
            space: updatedSpace,
        });
    } catch (error) {
        next(error);
    }
};

export const handleRemoveMember = async (
    req: RequestWithUserId,
    res: Response,
    next: NextFunction
) => {
    try {
        const userId = req.userId!;
        const { spaceId, memberId } = req.params;

        const updatedSpace = await removeMember(spaceId, userId, memberId);

        res.status(200).json({
            success: true,
            message: "Member successfully removed",
            space: updatedSpace,
        });
    } catch (error) {
        next(error);
    }
};

export const handleDeleteSpace = async (
    req: RequestWithUserId,
    res: Response,
    next: NextFunction
) => {
    try {
        const accountId = req.userId!;
        const { spaceId } = req.params;

        await deleteSpace(spaceId, accountId);

        res.status(200).json({
            success: true,
            message: "Space deleted successfully",
        });
    } catch (error) {
        next(error);
    }
};

export const handleCheckSpaceAccess = async (
    req: RequestWithUserId,
    res: Response,
    next: NextFunction
) => {
    try {
        const accountId = req.userId!;
        const { spaceId } = req.params;
        const accessInfo = await checkSpaceAccess(spaceId, accountId);

        res.status(200).json({
            success: true,
            data: accessInfo,
        });
    } catch (error) {
        next(error);
    }
};
