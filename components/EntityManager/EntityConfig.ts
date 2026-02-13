
export type FieldType = 'text' | 'number' | 'email' | 'select' | 'textarea' | 'boolean' | 'date';

export interface EntityFieldConfig {
    name: string;
    label: string | Record<string, string>; // Support dynamic labels per tenant type
    type: FieldType;
    required?: boolean;
    options?: { label: string; value: any }[]; // For select type
    placeholder?: string;
    readOnly?: boolean;
    hidden?: boolean; // Hidden from form but present in data
    tableShow?: boolean; // Whether to show in table view
    tenantTypes?: string[]; // e.g. ['INSTITUTION'] or ['CORPORATE'] for conditional display
}

export interface EntityConfig {
    entityType: string;
    displayName: Record<string, string>; // e.g., { 'CORPORATE': 'Employees', 'INSTITSTITUTION': 'Students' }
    apiEndpoint: string;
    fields: EntityFieldConfig[];
    primaryKey: string;
    defaultSort?: { field: string; direction: 'asc' | 'desc' };
    permissions?: {
        create?: string;
        read?: string;
        update?: string;
        delete?: string;
    };
}
