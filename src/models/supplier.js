/* eslint-disable eol-last */
/* eslint-disable indent */
const mongoose = require('mongoose');

const supplierSchema = new mongoose.Schema({
    firstname: String,
    lastname: String,
    auth: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Auth',
    },
});

const Supplier = mongoose.model('Supplier', supplierSchema);

module.exports = Supplier;