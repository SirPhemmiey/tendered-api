/* eslint-disable eol-last */
/* eslint-disable indent */
exports.contractorAddRequest = {
    properties: {
        contractor: {
            type: 'string',
        },
        machine_name: {
            type: 'string',
        },
        year: {
            type: 'string',
        },
        model: {
            type: 'string',
        },
        capacity: {
            type: 'string',
        },
        location: {
            type: 'string',
        },
        timeline: {
            type: 'string',
            format: 'date',
        },
    },
    required: ['contractor', 'machine_name', 'year', 'model', 'capacity', 'location', 'timeline'],
};