/* eslint-disable eol-last */
/* eslint-disable indent */
const mongoose = require('mongoose');

const contractorSchema = new mongoose.Schema({
    username: String,
    password: String,
});

// define compound indexes in the schema
contractorSchema.index({
    username: 1,
});


const Contractor = mongoose.model('Contractor', contractorSchema);

module.exports = Contractor;