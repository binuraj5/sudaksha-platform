
import React, { useState, useEffect, useCallback } from 'react';
import { EntityConfig } from './EntityConfig';
import { EntityTable } from './EntityTable';
import { EntityForm } from './EntityForm';
import { Button } from "@/components/ui/button";
import { Plus, Search, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { usePermissions } from "@/hooks/usePermissions";
import { Permission } from "@/lib/permissions/permissions";

interface EntityManagerProps {
    config: EntityConfig;
    tenantType: 'CORPORATE' | 'INSTITUTION' | 'SYSTEM';
}

export const EntityManager: React.FC<EntityManagerProps> = ({
    config,
    tenantType,
}) => {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [view, setView] = useState<'list' | 'create' | 'edit'>('list');
    const [selectedItem, setSelectedItem] = useState<any>(null);
    const [saving, setSaving] = useState(false);
    const { checkPermission } = usePermissions();

    const canCreate = checkPermission(`${config.entityType}:create` as Permission);
    const canUpdate = checkPermission(`${config.entityType}:update` as Permission);
    const canDelete = checkPermission(`${config.entityType}:delete` as Permission);

    const displayName = config.displayName[tenantType] || config.displayName['SYSTEM'] || 'Item';

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const response = await fetch(`${config.apiEndpoint}?search=${search}`);
            if (!response.ok) throw new Error('Failed to fetch data');
            const result = await response.json();
            setData(result.data || result);
        } catch (error) {
            toast.error(`Error loading ${displayName}s`);
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, [config.apiEndpoint, search, displayName]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleCreate = async (formData: any) => {
        setSaving(true);
        try {
            const response = await fetch(config.apiEndpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            if (!response.ok) throw new Error('Failed to create');
            toast.success(`${displayName} created successfully`);
            setView('list');
            fetchData();
        } catch (error) {
            toast.error(`Error creating ${displayName}`);
        } finally {
            setSaving(false);
        }
    };

    const handleUpdate = async (formData: any) => {
        setSaving(true);
        try {
            const response = await fetch(`${config.apiEndpoint}/${formData[config.primaryKey]}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            if (!response.ok) throw new Error('Failed to update');
            toast.success(`${displayName} updated successfully`);
            setView('list');
            fetchData();
        } catch (error) {
            toast.error(`Error updating ${displayName}`);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm(`Are you sure you want to delete this ${displayName}?`)) return;

        try {
            const response = await fetch(`${config.apiEndpoint}/${id}`, {
                method: 'DELETE',
            });
            if (!response.ok) throw new Error('Failed to delete');
            toast.success(`${displayName} deleted successfully`);
            fetchData();
        } catch (error) {
            toast.error(`Error deleting ${displayName}`);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">{displayName}s</h2>
                    <p className="text-gray-500">Manage your {displayName.toLowerCase()}s here.</p>
                </div>
                {view === 'list' && canCreate && (
                    <Button
                        onClick={() => {
                            setSelectedItem(null);
                            setView('create');
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Add {displayName}
                    </Button>
                )}
            </div>

            {view === 'list' ? (
                <div className="space-y-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder={`Search ${displayName.toLowerCase()}s...`}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-10"
                        />
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                        </div>
                    ) : (
                        <EntityTable
                            config={config}
                            data={data}
                            tenantType={tenantType}
                            onEdit={(item) => {
                                setSelectedItem(item);
                                setView('edit');
                            }}
                            onDelete={handleDelete}
                            canEdit={canUpdate}
                            canDelete={canDelete}
                        />
                    )}
                </div>
            ) : (
                <EntityForm
                    config={config}
                    initialData={selectedItem}
                    tenantType={tenantType}
                    onSubmit={view === 'create' ? handleCreate : handleUpdate}
                    onCancel={() => setView('list')}
                    loading={saving}
                />
            )}
        </div>
    );
};
