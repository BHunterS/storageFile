import React, { useState, useEffect } from "react";

import { useAuthStore } from "@/store/authStore";

import { getMyProfile, UpdateUserInfo } from "@/api/profile";

import { useToast } from "@/hooks/use-toast";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

import { AlertCircle, Save, User, Mail, Phone, MapPin } from "lucide-react";

import { UpdateUserInfoRequest } from "@/types/profile";

const ProfilePage: React.FC = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [profile, setProfile] = useState<UpdateUserInfoRequest>({
        name: "",
        email: "",
        avatar: "",
        bio: "",
        location: "",
        phone: "",
        birthdate: "",
    });
    const [formData, setFormData] = useState<UpdateUserInfoRequest>({
        name: "",
        email: "",
        avatar: "",
        bio: "",
        location: "",
        phone: "",
        birthdate: "",
    });

    const { toast } = useToast();
    const { user } = useAuthStore();

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const response = await UpdateUserInfo(formData);
            if (response.success) {
                toast({
                    title: "Profile updated",
                    description: "Your profile has been successfully updated.",
                });
                setProfile(formData);
            }
        } catch {
            console.error("Error updating profile");
        } finally {
            setIsLoading(false);
        }
    };

    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map((part) => part[0])
            .join("")
            .toUpperCase()
            .substring(0, 2);
    };

    useEffect(() => {
        const fetchProfile = async () => {
            setIsLoading(true);
            setError(null);
            try {
                if (user) {
                    const response = await getMyProfile();
                    const { name, email, avatar } = user;
                    const UpdateUserInfoRequest = {
                        ...response.profile,
                        name,
                        email,
                        avatar,
                    };

                    setProfile(UpdateUserInfoRequest);
                    setFormData(UpdateUserInfoRequest);
                }
            } catch {
                setError("Error: something went wrong");
            } finally {
                setIsLoading(false);
            }
        };

        fetchProfile();
    }, [user]);

    if (isLoading && !profile.name) {
        return (
            <div className="container mx-auto my-8 p-6">
                <div className="flex items-center gap-4 mb-8">
                    <Skeleton className="h-16 w-16 rounded-full" />
                    <div className="space-y-2">
                        <Skeleton className="h-6 w-48" />
                        <Skeleton className="h-4 w-32" />
                    </div>
                </div>
                <div className="space-y-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-24 w-full" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="my-8 p-4">
            <Tabs defaultValue="view" className="w-full">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8">
                    <div className="flex items-center gap-4 mb-4 sm:mb-0">
                        <Avatar className="h-16 w-16">
                            <AvatarImage
                                src={profile.avatar}
                                alt={profile.name}
                            />
                            <AvatarFallback>
                                {getInitials(profile.name)}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <h1 className="text-2xl font-bold">
                                {profile.name}
                            </h1>
                            <p className="text-muted-foreground">
                                {profile.email}
                            </p>
                        </div>
                    </div>
                    <TabsList className="mb-4 sm:mb-0">
                        <TabsTrigger value="view">View Profile</TabsTrigger>
                        <TabsTrigger value="edit">Edit Profile</TabsTrigger>
                    </TabsList>
                </div>

                {error && (
                    <Alert variant="destructive" className="mb-6">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                <TabsContent value="view">
                    <Card>
                        <CardHeader>
                            <CardTitle>Profile Information</CardTitle>
                            <CardDescription>
                                View your personal and professional information
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {profile.bio && (
                                <div>
                                    <h3 className="font-medium mb-2">About</h3>
                                    <p className="text-muted-foreground">
                                        {profile.bio}
                                    </p>
                                </div>
                            )}

                            <Separator />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2">
                                        <User className="h-4 w-4 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm text-muted-foreground">
                                                Full Name
                                            </p>
                                            <p>{profile.name}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Mail className="h-4 w-4 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm text-muted-foreground">
                                                Email
                                            </p>
                                            <p>{profile.email}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    {profile.location && (
                                        <div className="flex items-center gap-2">
                                            <MapPin className="h-4 w-4 text-muted-foreground" />
                                            <div>
                                                <p className="text-sm text-muted-foreground">
                                                    Location
                                                </p>
                                                <p>{profile.location}</p>
                                            </div>
                                        </div>
                                    )}
                                    {profile.phone && (
                                        <div className="flex items-center gap-2">
                                            <Phone className="h-4 w-4 text-muted-foreground" />
                                            <div>
                                                <p className="text-sm text-muted-foreground">
                                                    Phone
                                                </p>
                                                <p>{profile.phone}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="edit">
                    <Card>
                        <form onSubmit={handleSubmit}>
                            <CardHeader>
                                <CardTitle>Edit Profile</CardTitle>
                                <CardDescription>
                                    Update your personal and professional
                                    information
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="name">
                                                Full Name
                                            </Label>
                                            <Input
                                                id="name"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="email">Email</Label>
                                            <Input
                                                id="email"
                                                name="email"
                                                type="email"
                                                value={formData.email}
                                                onChange={handleInputChange}
                                                required
                                                disabled
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="bio">Bio</Label>
                                        <Textarea
                                            id="bio"
                                            name="bio"
                                            value={formData.bio || ""}
                                            onChange={handleInputChange}
                                            placeholder="Write a short bio about yourself"
                                            className="min-h-24"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="phone">Phone</Label>
                                            <Input
                                                id="phone"
                                                name="phone"
                                                value={formData.phone || ""}
                                                onChange={handleInputChange}
                                                placeholder="+1 (555) 123-4567"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="location">
                                                Location
                                            </Label>
                                            <Input
                                                id="location"
                                                name="location"
                                                value={formData.location || ""}
                                                onChange={handleInputChange}
                                                placeholder="City, Country"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="birthdate">
                                                Birth Date
                                            </Label>
                                            <Input
                                                id="birthdate"
                                                name="birthdate"
                                                type="date"
                                                value={formData.birthdate || ""}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="flex justify-end">
                                <Button type="submit" disabled={isLoading}>
                                    {isLoading ? (
                                        <span className="flex items-center gap-2">
                                            <span className="animate-spin h-4 w-4 border-2 border-t-2 border-t-transparent rounded-full"></span>
                                            Saving...
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-2">
                                            <Save className="h-4 w-4" />
                                            Save Changes
                                        </span>
                                    )}
                                </Button>
                            </CardFooter>
                        </form>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default ProfilePage;
