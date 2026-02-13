"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";

const TIMEZONES = ["Asia/Kolkata", "Asia/Dubai", "Europe/London", "America/New_York", "America/Los_Angeles"];
const BUSINESS_LINES = [
    "Technology / IT Services",
    "Healthcare",
    "Education",
    "Finance / Banking",
    "Manufacturing",
    "Retail / E-commerce",
    "Professional Services",
    "Other"
];
const INSTITUTION_TYPES = [
    "University",
    "College",
    "School (K-12)",
    "Polytechnic",
    "Institute",
    "Research Institute",
    "Community College",
    "Business School / Management Institute",
    "Other"
];

export function OrganizationForm({ clientId }: { clientId: string }) {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [organization, setOrganization] = useState({
        name: "",
        city: "",
        district: "",
        state: "",
        country: "",
        timezone: "",
        description: "",
        lineOfBusiness: "",
        website: "",
        phone: "",
        type: "CORPORATE"
    });

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await fetch(`/api/clients/${clientId}/settings`);
                if (res.ok) {
                    const data = await res.json();
                    if (data.organization) setOrganization(data.organization);
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
        setOrganization(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await fetch(`/api/clients/${clientId}/settings`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ organization })
            });

            if (res.ok) {
                toast.success("Organization details saved");
            } else {
                toast.error("Failed to save settings");
            }
        } catch (error) {
            toast.error("An error occurred");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;

    return (
        <Card>
            <CardHeader>
                <CardTitle>Organization Details</CardTitle>
                <CardDescription>Legal and contact information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label>{organization.type === 'INSTITUTION' ? 'Institution Name' : 'Company Name'}</Label>
                        <Input value={organization.name} disabled className="bg-gray-50" />
                    </div>
                    <div className="space-y-2">
                        <Label>{organization.type === 'INSTITUTION' ? 'Institution Type' : 'Line of Business'}</Label>
                        <Select
                            value={organization.lineOfBusiness || ""}
                            onValueChange={(val) => handleChange('lineOfBusiness', val)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder={organization.type === 'INSTITUTION' ? "Select Type" : "Select Industry"} />
                            </SelectTrigger>
                            <SelectContent>
                                {(organization.type === 'INSTITUTION' ? INSTITUTION_TYPES : BUSINESS_LINES).map((item) => (
                                    <SelectItem key={item} value={item}>{item}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2 md:col-span-2">
                        <Label>Description</Label>
                        <Textarea
                            placeholder="Brief about your company (Max 500 chars)"
                            maxLength={500}
                            value={organization.description || ""}
                            onChange={(e) => handleChange('description', e.target.value)}
                        />
                    </div>

                    {/* Address */}
                    <div className="space-y-2">
                        <Label>City</Label>
                        <Input
                            value={organization.city || ""}
                            onChange={(e) => handleChange('city', e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>District</Label>
                        <Input
                            value={organization.district || ""}
                            onChange={(e) => handleChange('district', e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>State</Label>
                        <Input
                            value={organization.state || ""}
                            onChange={(e) => handleChange('state', e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Country</Label>
                        <Input
                            value={organization.country || ""}
                            onChange={(e) => handleChange('country', e.target.value)}
                        />
                    </div>

                    {/* Contact */}
                    <div className="space-y-2">
                        <Label>Website</Label>
                        <Input
                            type="url"
                            placeholder="https://..."
                            value={organization.website || ""}
                            onChange={(e) => handleChange('website', e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Phone</Label>
                        <Input
                            type="tel"
                            value={organization.phone || ""}
                            onChange={(e) => handleChange('phone', e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Timezone</Label>
                        <Select
                            value={organization.timezone || "Asia/Kolkata"}
                            onValueChange={(val) => handleChange('timezone', val)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select Timezone" />
                            </SelectTrigger>
                            <SelectContent>
                                {TIMEZONES.map(tz => (
                                    <SelectItem key={tz} value={tz}>{tz}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="flex justify-end mt-4">
                    <Button onClick={handleSave} disabled={saving} size="lg">
                        {saving ? <Loader2 className="mr-2 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                        Save Changes
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
