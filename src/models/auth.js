/* eslint-disable eol-last */
/* eslint-disable indent */
const mongoose = require('mongoose');

const authSchema = new mongoose.Schema({
    username: String,
    password: String,
    type: {
        type: String,
        enum: ['contractor', 'supplier'],
    },
});

// define compound indexes in the schema
authSchema.index({
    username: 1,
    type: 1,
});


const Auth = mongoose.model('Auth', authSchema);

module.exports = Auth;