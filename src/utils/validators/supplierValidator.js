/* eslint-disable eol-last */
/* eslint-disable indent */
exports.supplierLogin = {
    properties: {
        username: {
            type: 'string',
        },
        password: {
            type: 'string',
            minLength: 8,
            pattern: '^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9]).{8,}$',
        },
    },
    errorMessage: {
        properties: {
            username: 'is required, it should be string',
            password: 'should have 8 characters minimum, contain at least 1 capital letter, lower case letter and number',
        },
    },
    required: ['username', 'password'],
};

exports.supplierRegistration = {
    properties: {
        username: {
            type: 'string',
        },
        password: {
            type: 'string',
            minLength: 8,
            pattern: '^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9]).{8,}$',
        },
        confirm_password: {
            const: {
                $data: '1/password',
            },
            type: 'string',
        },
    },
    errorMessage: {
        properties: {
            username: 'is required, it should be string',
            password: 'should have 8 characters minimum, contain at least 1 capital letter, lower case letter and number',
            confirm_password: 'should be the same as password',
        },
    },
    required: ['username', 'password', 'confirm_password'],
};


exports.supplierBid = {
    properties: {
        supplier: {
            type: 'number',
        },
        contractor: {
            type: 'number',
        },
        request: {
            type: 'number',
        },
    },
    required: ['supplier', 'contractor', 'request'],
};