/* eslint-disable eol-last */
/* eslint-disable indent */
exports.contractorAddRequest = {
    properties: {
        machine_name: {
            type: 'string',
        },
        year: {
            type: 'integer',
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
    required: ['machine_name',
        'year',
        'model',
        'capacity',
        'location',
        'timeline',
    ],
};

exports.contractorListRequests = {
    properties: {
        status: {
            type: 'string',
            enum: ['pending', 'completed'],
        },
    },
}

exports.contractorRequestBids = {
    properties: {
        request: {
            type: 'string',
        },
    },
    required: ['request'],
};