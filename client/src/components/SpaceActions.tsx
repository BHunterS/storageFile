import { useState } from "react";
import { Pencil, Trash2, UserPlus } from "lucide-react";

import { addMember, updateSpace } from "@/api/space";

import { useUploadStore } from "@/store/uploadStore";

import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

import { Space } from "@/types";

type Props = {
    space: Space;
    handleDeleteSpace: (spaceId: string) => Promise<void>;
};

const SpaceActions = ({ space, handleDeleteSpace }: Props) => {
    const [open, setOpen] = useState(false);
    const [name, setName] = useState(space.name);
    const [description, setDescription] = useState(space.description || "");

    const [addDialogOpen, setAddDialogOpen] = useState(false);
    const [email, setEmail] = useState("");
    const [role, setRole] = useState<"admin" | "editor" | "viewer">("viewer");
    const [isAdding, setIsAdding] = useState(false);

    const { toggleTrigger } = useUploadStore();

    const handleUpdate = async () => {
        try {
            await updateSpace(space._id, { name, description });
            toggleTrigger();
            setOpen(false);
        } catch (error) {
            console.error(error);
        }
    };

    const handleAddMember = async () => {
        try {
            setIsAdding(true);
            await addMember(space._id, { email, role });
            toggleTrigger();
            setAddDialogOpen(false);
            setEmail("");
            setRole("viewer");
        } catch (error) {
            console.error("Error adding member:", error);
        } finally {
            setIsAdding(false);
        }
    };

    return (
        <div className="flex items-center gap-2">
            {/* Add member button */}
            <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
                <DialogTrigger asChild>
                    <button
                        className="p-1 rounded hover:bg-muted"
                        title="Add member"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <UserPlus className="w-6 h-6 text-muted-foreground" />
                    </button>
                </DialogTrigger>
                <DialogContent onClick={(e) => e.stopPropagation()}>
                    <DialogHeader>
                        <DialogTitle>Add Member</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <Input
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <Select
                            value={role}
                            onValueChange={(
                                val: "admin" | "editor" | "viewer"
                            ) => setRole(val)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select role" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="admin">Admin</SelectItem>
                                <SelectItem value="editor">Editor</SelectItem>
                                <SelectItem value="viewer">Viewer</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <DialogFooter>
                        <Button onClick={handleAddMember} disabled={isAdding}>
                            {isAdding ? "Adding..." : "Add"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Button */}
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    <button
                        className="p-1 rounded hover:bg-muted"
                        title="Edit space"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <Pencil className="w-6 h-6 text-muted-foreground" />
                    </button>
                </DialogTrigger>
                <DialogContent onClick={(e) => e.stopPropagation()}>
                    <DialogHeader>
                        <DialogTitle>Edit Space</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <Input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Name"
                        />
                        <Textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Description"
                        />
                    </div>
                    <DialogFooter>
                        <Button onClick={handleUpdate}>Save</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Button */}
            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <button
                        className="p-1 rounded hover:bg-destructive/10 text-destructive"
                        onClick={(e) => e.stopPropagation()} // prevent toggle
                        title="Delete space"
                    >
                        <Trash2 className="w-6 h-6" />
                    </button>
                </AlertDialogTrigger>
                <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action will permanently delete the space{" "}
                            <b>{space.name}</b> and remove all members.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-destructive hover:bg-destructive/90 text-white"
                            onClick={() => handleDeleteSpace(space._id)}
                        >
                            Yes, delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default SpaceActions;
