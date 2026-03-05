"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { LogoUpload } from "./LogoUpload";

export function BrandingSettings({ clientId }: { clientId: string }) {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [branding, setBranding] = useState({
        logoUrl: "",
        primaryColor: "#4f46e5",
        secondaryColor: "#ec4899"
    });

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await fetch(`/api/clients/${clientId}/settings`);
                if (res.ok) {
                    const data = await res.json();
                    if (data.branding) setBranding(data.branding);
                }
            } catch (error) {
                console.error("Failed to load settings", error);
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, [clientId]);

    const handleChange = (field: string, value: string) => {
        setBranding(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await fetch(`/api/clients/${clientId}/settings`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ branding })
            });

            if (res.ok) {
                toast.success("Branding updated");
                router.refresh();
            } else {
                toast.error("Failed to save");
            }
        } catch (error) {
            toast.error("An error occurred");
        } finally {
            setSaving(false);
        }
    };

    const handleLogoUpload = (url: string) => {
        handleChange('logoUrl', url);
    };

    if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;

    return (
        <Card>
            <CardHeader>
                <CardTitle>Branding & Identity</CardTitle>
                <CardDescription>Customize your portal's look and feel</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex flex-col md:flex-row gap-8">
                    <div className="flex-1 space-y-4">
                        <div className="space-y-2">
                            <Label>Company Logo</Label>
                            <LogoUpload
                                currentLogo={branding.logoUrl}
                                onUpload={handleLogoUpload}
                                clientId={clientId}
                            />
                        </div>
                    </div>
                    <div className="flex-1 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Primary Color</Label>
                                <div className="flex items-center gap-2">
                                    <Input
                                        type="color"
                                        value={branding.primaryColor}
                                        onChange={(e) => handleChange('primaryColor', e.target.value)}
                                        className="w-12 h-12 p-1 cursor-pointer"
                                    />
                                    <Input
                                        value={branding.primaryColor}
                                        onChange={(e) => handleChange('primaryColor', e.target.value)}
                                        className="font-mono uppercase"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Secondary Color</Label>
                                <div className="flex items-center gap-2">
                                    <Input
                                        type="color"
                                        value={branding.secondaryColor}
                                        onChange={(e) => handleChange('secondaryColor', e.target.value)}
                                        className="w-12 h-12 p-1 cursor-pointer"
                                    />
                                    <Input
                                        value={branding.secondaryColor}
                                        onChange={(e) => handleChange('secondaryColor', e.target.value)}
                                        className="font-mono uppercase"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="p-4 rounded-lg bg-gray-50 border border-gray-100">
                            <p className="text-sm font-medium mb-2">Live Preview</p>
                            <Button
                                style={{ backgroundColor: branding.primaryColor }}
                                className="w-full"
                            >
                                Primary Button
                            </Button>
                            <Button
                                variant="outline"
                                style={{ color: branding.primaryColor, borderColor: branding.primaryColor }}
                                className="w-full mt-2"
                            >
                                Secondary Button
                            </Button>
                        </div>
                    </div>
                </div>
                <div className="flex justify-end">
                    <Button onClick={handleSave} disabled={saving}>
                        {saving ? <Loader2 className="mr-2 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                        Save Branding
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
