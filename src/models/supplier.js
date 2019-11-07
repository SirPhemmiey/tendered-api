/* eslint-disable eol-last */
/* eslint-disable indent */
const mongoose = require('mongoose');

const supplierSchema = new mongoose.Schema({
    username: String,
    password: String,
});

// define compound indexes in the schema
supplierSchema.index({
    username: 1,
});


const Supplier = mongoose.model('Supplier', supplierSchema);

module.exports = Supplier;