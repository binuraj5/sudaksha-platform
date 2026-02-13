"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

const INDUSTRIES = [
    "Information Technology",
    "Healthcare",
    "Finance",
    "Manufacturing",
    "Education",
    "Retail",
];

const LEVELS = [
    { value: "JUNIOR", label: "Junior / Entry Level" },
    { value: "MIDDLE", label: "Middle / Senior" },
    { value: "SENIOR", label: "Lead / Principal" },
    { value: "EXPERT", label: "Expert / C-Level" },
];

interface RoleBasicInfoProps {
    data: any;
    setData: (data: any) => void;
    selectedIndustries: string[];
    setSelectedIndustries: (industries: string[]) => void;
}

export function RoleBasicInfo({ data, setData, selectedIndustries, setSelectedIndustries }: RoleBasicInfoProps) {

    const handleChange = (field: string, value: string) => {
        setData({ ...data, [field]: value });

        // Auto-generate code from name if code is empty
        if (field === "name" && !data.code && value) {
            const codeGen = value.toUpperCase().replace(/[^A-Z0-9]/g, "_").slice(0, 20);
            setData((prev: any) => ({ ...prev, name: value, code: codeGen }));
        }
    };

    const toggleIndustry = (industry: string) => {
        if (selectedIndustries.includes(industry)) {
            setSelectedIndustries(selectedIndustries.filter(i => i !== industry));
        } else {
            setSelectedIndustries([...selectedIndustries, industry]);
        }
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label htmlFor="name">Role Title <span className="text-red-500">*</span></Label>
                    <Input
                        id="name"
                        placeholder="e.g. Senior Backend Engineer"
                        value={data.name}
                        onChange={(e) => handleChange("name", e.target.value)}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="code">Role Code <span className="text-red-500">*</span></Label>
                    <Input
                        id="code"
                        placeholder="e.g. SR_BE_ENG"
                        value={data.code}
                        onChange={(e) => handleChange("code", e.target.value)}
                    />
                    <p className="text-xs text-slate-500">Unique identifier for this role.</p>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label htmlFor="level">Proficiency Level</Label>
                    <Select
                        value={data.overallLevel}
                        onValueChange={(val) => handleChange("overallLevel", val)}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select level" />
                        </SelectTrigger>
                        <SelectContent>
                            {LEVELS.map((lvl) => (
                                <SelectItem key={lvl.value} value={lvl.value}>
                                    {lvl.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="department">Department (Optional)</Label>
                    <Input
                        id="department"
                        placeholder="e.g. Engineering"
                        value={data.department || ""}
                        onChange={(e) => handleChange("department", e.target.value)}
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label>Applicable Industries</Label>
                <div className="flex flex-wrap gap-2">
                    {INDUSTRIES.map((ind) => (
                        <Badge
                            key={ind}
                            variant={selectedIndustries.includes(ind) ? "default" : "outline"}
                            className="cursor-pointer"
                            onClick={() => toggleIndustry(ind)}
                        >
                            {ind}
                        </Badge>
                    ))}
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="description">Job Description / Summary</Label>
                <Textarea
                    id="description"
                    placeholder="Briefly describe the key responsibilities..."
                    className="h-32"
                    value={data.description || ""}
                    onChange={(e) => handleChange("description", e.target.value)}
                />
                <p className="text-xs text-slate-500">
                    Providing a detailed description helps the AI generator suggest better competencies.
                </p>
            </div>
        </div>
    );
}
