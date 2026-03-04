
import React, { useState, useEffect } from 'react';
import { EntityConfig, EntityFieldConfig } from './EntityConfig';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

interface EntityFormProps {
    config: EntityConfig;
    initialData?: any;
    tenantType: string;
    onSubmit: (data: any) => void;
    onCancel: () => void;
    loading: boolean;
}

export const EntityForm: React.FC<EntityFormProps> = ({
    config,
    initialData,
    tenantType,
    onSubmit,
    onCancel,
    loading,
}) => {
    const [formData, setFormData] = useState<any>(initialData || {});

    useEffect(() => {
        if (initialData) {
            setFormData(initialData);
        }
    }, [initialData]);

    const getLabel = (field: EntityFieldConfig) => {
        if (typeof field.label === 'string') return field.label;
        return field.label[tenantType] || field.label['default'] || field.name;
    };

    const handleChange = (name: string, value: any) => {
        setFormData((prev: any) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg border">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {config.fields.filter(f => !f.hidden).map((field) => {
                    const label = getLabel(field);
                    return (
                        <div key={field.name} className="space-y-2">
                            <Label htmlFor={field.name}>
                                {label}
                                {field.required && <span className="text-red-500 ml-1">*</span>}
                            </Label>

                            {field.type === 'textarea' ? (
                                <Textarea
                                    id={field.name}
                                    value={formData[field.name] || ''}
                                    onChange={(e) => handleChange(field.name, e.target.value)}
                                    required={field.required}
                                    placeholder={field.placeholder}
                                    disabled={field.readOnly}
                                />
                            ) : field.type === 'select' ? (
                                <Select
                                    value={formData[field.name]}
                                    onValueChange={(value) => handleChange(field.name, value)}
                                    required={field.required}
                                    disabled={field.readOnly}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder={`Select ${label}`} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {field.options?.map((opt) => (
                                            <SelectItem key={opt.value} value={opt.value}>
                                                {opt.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            ) : field.type === 'boolean' ? (
                                <div className="flex items-center space-x-2 pt-2">
                                    <Checkbox
                                        id={field.name}
                                        checked={formData[field.name] || false}
                                        onCheckedChange={(checked) => handleChange(field.name, !!checked)}
                                        disabled={field.readOnly}
                                    />
                                    <Label htmlFor={field.name}>{label}</Label>
                                </div>
                            ) : (
                                <Input
                                    id={field.name}
                                    type={field.type}
                                    value={formData[field.name] || ''}
                                    onChange={(e) => handleChange(field.name, e.target.value)}
                                    required={field.required}
                                    placeholder={field.placeholder}
                                    disabled={field.readOnly}
                                />
                            )}
                        </div>
                    );
                })}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
                <Button type="button" variant="outline" onClick={onCancel}>
                    Cancel
                </Button>
                <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white">
                    {loading ? 'Saving...' : (initialData ? 'Update' : 'Create')}
                </Button>
            </div>
        </form>
    );
};
