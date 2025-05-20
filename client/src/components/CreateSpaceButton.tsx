import { useState, ChangeEvent } from "react";

import { Plus } from "lucide-react";

import { createSpace } from "@/api/space";

import { useUploadStore } from "@/store/uploadStore";

import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

const CreateSpaceButton = () => {
    const [open, setOpen] = useState(false);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [logo, setLogo] = useState<string | undefined>(undefined);
    const [loading, setLoading] = useState(false);
    const { toggleTrigger } = useUploadStore();

    const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            setLogo(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleCreate = async () => {
        if (!name.trim()) {
            return;
        }

        setLoading(true);
        try {
            await createSpace({ name, description, logo });
            setName("");
            setDescription("");
            setLogo(undefined);
            setOpen(false);
            toggleTrigger();
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="default">
                    <Plus className="w-8 h-8" /> Create Space
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create a new space</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    <Input
                        placeholder="Space name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                    <Textarea
                        placeholder="Description (optional)"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                    <Input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                    />
                    {logo && (
                        <img
                            src={logo}
                            alt="Preview"
                            className="w-24 h-24 rounded object-cover border"
                        />
                    )}
                </div>

                <DialogFooter>
                    <Button onClick={handleCreate} disabled={loading}>
                        {loading ? "Creating..." : "Create"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default CreateSpaceButton;
