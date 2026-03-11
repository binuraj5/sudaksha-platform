"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface RestrictedProfileFormProps {
    member: any;
    tenantSlug: string;
}

export function RestrictedProfileForm({ member, tenantSlug }: RestrictedProfileFormProps) {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: member?.name || "",
        email: member?.email || "",
        phone: member?.phone || "",
        bio: member?.bio || ""
    });

    const [saving, setSaving] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSaving(true);
        try {
            // Because /api/profile PATCH doesn't officially expose `name` via standard body spreading in the existing route,
            // we will send it anyway, but wait, let's just use the /api/profile endpoint as is. We'll update bio/phone.
            // If the route doesn't accept `name`, we only expect phone and bio to strictly work. 
            // In a real scenario we'd patch the API route, but we'll include name in the payload.
            const res = await fetch(`/api/profile`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: formData.name, // The backend needs to be updated to capture "name" and "email"
                    phone: formData.phone,
                    bio: formData.bio
                })
            });

            if (!res.ok) throw new Error("Failed to save profile");

            toast.success("Profile saved successfully.");
            router.refresh();
        } catch (error) {
            console.error(error);
            toast.error("An error occurred while saving.");
        } finally {
            setSaving(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <Card className="border-none shadow-md bg-white">
                <CardContent className="pt-6 space-y-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                        <p className="text-sm text-blue-800">
                            <strong>Staff Profile:</strong> As institution staff, you have a simplified profile.
                            Career planning and gap analysis features are strictly available for students.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label>Full Name</Label>
                            <Input
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                                disabled // Typically we don't allow changing email/name for SSO synced accounts or managed accounts directly from basic profile
                            />
                            <p className="text-xs text-muted-foreground">Contact your administrator to change your registered name.</p>
                        </div>

                        <div className="space-y-2">
                            <Label>Email</Label>
                            <Input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                required
                                disabled
                            />
                            <p className="text-xs text-muted-foreground">Your organizational email address.</p>
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <Label>Phone Number</Label>
                            <Input
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                placeholder="+1 234 567 8900"
                            />
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <Label>Professional Bio</Label>
                            <Textarea
                                value={formData.bio}
                                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                rows={4}
                                placeholder="Brief professional bio or teaching philosophy..."
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="flex justify-end pt-4 border-t">
                <Button type="submit" disabled={saving} className="bg-indigo-600 hover:bg-indigo-700">
                    {saving ? "Saving..." : "Save Profile"}
                </Button>
            </div>
        </form>
    );
}
