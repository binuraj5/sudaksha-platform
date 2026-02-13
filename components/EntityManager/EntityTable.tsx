
import React from 'react';
import { EntityConfig, EntityFieldConfig } from './EntityConfig';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";

interface EntityTableProps {
    config: EntityConfig;
    data: any[];
    tenantType: string;
    onEdit: (item: any) => void;
    onDelete: (id: string) => void;
    canEdit?: boolean;
    canDelete?: boolean;
}

export const EntityTable: React.FC<EntityTableProps> = ({
    config,
    data,
    tenantType,
    onEdit,
    onDelete,
    canEdit = true,
    canDelete = true,
}) => {
    const getLabel = (field: EntityFieldConfig) => {
        if (typeof field.label === 'string') return field.label;
        return field.label[tenantType] || field.label['default'] || field.name;
    };

    const visibleFields = config.fields.filter(f => f.tableShow !== false);

    return (
        <div className="rounded-md border bg-white">
            <Table>
                <TableHeader>
                    <TableRow>
                        {visibleFields.map((field) => (
                            <TableHead key={field.name}>{getLabel(field)}</TableHead>
                        ))}
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={visibleFields.length + 1} className="text-center h-24 text-gray-500">
                                No records found.
                            </TableCell>
                        </TableRow>
                    ) : (
                        data.map((item) => (
                            <TableRow key={item[config.primaryKey]}>
                                {visibleFields.map((field) => (
                                    <TableCell key={field.name}>
                                        {field.type === 'boolean'
                                            ? (item[field.name] ? 'Yes' : 'No')
                                            : item[field.name]?.toString() || '-'}
                                    </TableCell>
                                ))}
                                {(canEdit || canDelete) && (
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            {canEdit && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => onEdit(item)}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                            )}
                                            {canDelete && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                    onClick={() => onDelete(item[config.primaryKey])}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                    </TableCell>
                                )}
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    );
};
