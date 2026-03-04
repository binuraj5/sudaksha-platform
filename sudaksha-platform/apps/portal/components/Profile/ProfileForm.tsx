"use client";

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { Upload, User, Mail, Phone, MapPin, Linkedin, Globe } from "lucide-react";

const profileSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email(),
    phone: z.string().optional(),
    bio: z.string().max(500, "Bio must not exceed 500 characters").optional(),
    location: z.string().optional(),
    linkedinUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
    websiteUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
    avatarUrl: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

interface ProfileFormProps {
    initialData?: Partial<ProfileFormValues>;
    readOnly?: boolean;
}

export function ProfileForm({ initialData, readOnly = false }: ProfileFormProps) {
    const [isEditing, setIsEditing] = useState(!readOnly);

    const form = useForm<ProfileFormValues>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            name: initialData?.name || "",
            email: initialData?.email || "",
            phone: initialData?.phone || "",
            bio: initialData?.bio || "",
            location: initialData?.location || "",
            linkedinUrl: initialData?.linkedinUrl || "",
            websiteUrl: initialData?.websiteUrl || "",
            avatarUrl: initialData?.avatarUrl || "",
        },
    });

    async function onSubmit(data: ProfileFormValues) {
        try {
            // TODO: Implement API call
            console.log("Submitting profile data:", data);

            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 1000));

            toast.success("Profile updated successfully");
            setIsEditing(false);
        } catch (error) {
            toast.error("Failed to update profile");
            console.error(error);
        }
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div className="space-y-1">
                        <CardTitle>Personal Information</CardTitle>
                        <CardDescription>
                            Manage your personal details and public profile.
                        </CardDescription>
                    </div>
                    {!readOnly && !isEditing && (
                        <Button onClick={() => setIsEditing(true)} variant="outline">
                            Edit Profile
                        </Button>
                    )}
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                            {/* Avatar Section */}
                            <div className="flex items-center gap-6">
                                <Avatar className="h-24 w-24">
                                    {form.watch("avatarUrl") ? (
                                        <AvatarImage src={form.getValues("avatarUrl")} />
                                    ) : null}
                                    <AvatarFallback className="text-lg">
                                        {initialData?.name?.charAt(0) || "U"}
                                    </AvatarFallback>
                                </Avatar>
                                {isEditing && (
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <Button type="button" variant="outline" size="sm">
                                                <Upload className="mr-2 h-4 w-4" />
                                                Change Photo
                                            </Button>
                                            <Button type="button" variant="ghost" size="sm" className="text-red-500 hover:text-red-600">
                                                Remove
                                            </Button>
                                        </div>
                                        <FormDescription>
                                            JPG, GIF or PNG. Max size of 800K.
                                        </FormDescription>
                                    </div>
                                )}
                            </div>

                            <div className="grid gap-6 md:grid-cols-2">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Full Name</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                                    <Input className="pl-9" placeholder="John Doe" {...field} disabled={!isEditing} />
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Email Address</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                                    <Input className="pl-9" placeholder="john@example.com" {...field} disabled={true} />
                                                </div>
                                            </FormControl>
                                            <FormDescription>
                                                Email address cannot be changed.
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="phone"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Phone Number</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                                    <Input className="pl-9" placeholder="+1 (555) 000-0000" {...field} disabled={!isEditing} />
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="location"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Location</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                                    <Input className="pl-9" placeholder="New York, USA" {...field} disabled={!isEditing} />
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="linkedinUrl"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>LinkedIn Profile</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <Linkedin className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                                    <Input className="pl-9" placeholder="https://linkedin.com/in/..." {...field} disabled={!isEditing} />
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="websiteUrl"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Website / Portfolio</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <Globe className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                                    <Input className="pl-9" placeholder="https://..." {...field} disabled={!isEditing} />
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="bio"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Bio</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Tell us a little bit about yourself..."
                                                className="min-h-[120px]"
                                                {...field}
                                                disabled={!isEditing}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            Brief description for your profile (max 500 characters).
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {isEditing && (
                                <div className="flex justify-end gap-4">
                                    <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                                        Cancel
                                    </Button>
                                    <Button type="submit">
                                        Save Changes
                                    </Button>
                                </div>
                            )}
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}
