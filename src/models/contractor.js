/* eslint-disable eol-last */
/* eslint-disable indent */
const mongoose = require('mongoose');

const contractorSchema = new mongoose.Schema({
    firstname: String,
    lastname: String,
    auth: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Auth',
    },
});

const Contractor = mongoose.model('Contractor', contractorSchema);

module.exports = Contractor;