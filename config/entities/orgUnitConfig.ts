
import { EntityConfig } from '../../components/EntityManager/EntityConfig';

export const orgUnitConfig: EntityConfig = {
    entityType: 'orgUnits',
    displayName: {
        'CORPORATE': 'Department',
        'INSTITUTION': 'Faculty',
        'SYSTEM': 'Unit'
    },
    apiEndpoint: '/api/entities/orgUnits',
    primaryKey: 'id',
    fields: [
        {
            name: 'name',
            label: 'Name',
            type: 'text',
            required: true,
            tableShow: true
        },
        {
            name: 'code',
            label: 'Code',
            type: 'text',
            required: true,
            tableShow: true
        },
        {
            name: 'description',
            label: 'Description',
            type: 'textarea',
            tableShow: true
        },
        {
            name: 'headName',
            label: {
                'CORPORATE': 'Head of Department',
                'INSTITUTION': 'Dean'
            },
            type: 'text',
            tableShow: true
        }
    ]
};
