/* eslint-disable eol-last */
/* eslint-disable indent */
exports.login = {
    properties: {
        username: {
            type: 'string',
        },
        password: {
            type: 'string',
            minLength: 8,
            pattern: '^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9]).{8,}$',
        },
        type: {
            type: 'string',
            enum: ['supplier', 'contractor'],
        },
    },
    errorMessage: {
        properties: {
            username: 'is required, it should be string',
            password: 'should have 8 characters minimum, contain at least 1 capital letter, lower case letter and number',
            type: 'should be a string and of type "supplier" or "contractor"',
        },
    },
    required: ['username', 'password', 'type'],
};

exports.register = {
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
        type: {
            type: 'string',
            enum: ['supplier', 'contractor'],
        },
        firstname: {
            type: 'string',
        },
        lastname: {
            type: 'string',
        },
    },
    errorMessage: {
        properties: {
            username: 'is required, it should be string',
            password: 'should have 8 characters minimum, contain at least 1 capital letter, lower case letter and number',
            confirm_password: 'should be the same as password',
            type: 'should be a string and of type "supplier" or "contractor"',
            firstname: 'is required and it should be string',
            lastname: 'is required and it should be string',
        },
    },
    required: ['username', 'password', 'confirm_password', 'type', 'firstname', 'lastname'],
};