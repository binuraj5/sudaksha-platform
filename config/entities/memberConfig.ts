
import { EntityConfig } from '../../components/EntityManager/EntityConfig';

export const memberConfig: EntityConfig = {
    entityType: 'members',
    displayName: {
        'CORPORATE': 'Employee',
        'INSTITUTION': 'Student',
        'SYSTEM': 'User'
    },
    apiEndpoint: '/api/entities/members',
    primaryKey: 'id',
    defaultSort: { field: 'name', direction: 'asc' },
    fields: [
        {
            name: 'name',
            label: 'Full Name',
            type: 'text',
            required: true,
            tableShow: true
        },
        {
            name: 'email',
            label: 'Email Address',
            type: 'email',
            required: true,
            tableShow: true
        },
        {
            name: 'role',
            label: 'Role',
            type: 'select',
            required: true,
            tableShow: true,
            options: [
                { label: 'Admin', value: 'ADMIN' },
                { label: 'Member', value: 'MEMBER' },
                { label: 'Assessor', value: 'ASSESSOR' }
            ]
        },
        {
            name: 'memberType',
            label: {
                'CORPORATE': 'Employment Type',
                'INSTITUTION': 'Enrollment Type'
            },
            type: 'select',
            tableShow: true,
            options: [
                { label: 'Full-time', value: 'FULL_TIME' },
                { label: 'Contract', value: 'CONTRACT' }
            ]
        },
        {
            name: 'externalId',
            label: 'External ID',
            type: 'text',
            tableShow: false
        },
        {
            name: 'enrollmentNumber',
            label: 'Enrollment No.',
            type: 'text',
            tableShow: true,
            tenantTypes: ['INSTITUTION']
        },
        {
            name: 'employeeId',
            label: 'Employee ID',
            type: 'text',
            tableShow: true,
            tenantTypes: ['CORPORATE']
        },
        {
            name: 'hasGraduated',
            label: 'Graduated',
            type: 'boolean',
            tableShow: true,
            tenantTypes: ['INSTITUTION']
        },
        {
            name: 'graduationDate',
            label: 'Graduation Date',
            type: 'date',
            tableShow: true,
            tenantTypes: ['INSTITUTION']
        }
    ]
};
