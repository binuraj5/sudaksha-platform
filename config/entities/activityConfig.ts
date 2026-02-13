
import { EntityConfig } from '../../components/EntityManager/EntityConfig';

export const activityConfig: EntityConfig = {
    entityType: 'activities',
    displayName: {
        'CORPORATE': 'Project',
        'INSTITUTION': 'Cohort / Year',
        'SYSTEM': 'Activity'
    },
    apiEndpoint: '/api/entities/activities',
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
            name: 'description',
            label: 'Description',
            type: 'textarea',
            tableShow: true
        },
        {
            name: 'status',
            label: 'Status',
            type: 'select',
            options: [
                { label: 'Active', value: 'ACTIVE' },
                { label: 'Completed', value: 'COMPLETED' },
                { label: 'Draft', value: 'DRAFT' }
            ],
            tableShow: true
        },
        {
            name: 'startDate',
            label: 'Start Date',
            type: 'date',
            tableShow: true
        },
        {
            name: 'endDate',
            label: 'End Date',
            type: 'date',
            tableShow: true
        }
    ]
};
