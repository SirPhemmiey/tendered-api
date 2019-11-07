/* eslint-disable eol-last */
/* eslint-disable indent */
const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
    contractor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Contractor',
    },
    machine_name: String,
    year: String,
    model: String,
    capacity: String,
    location: String,
    status: {
        type: String,
        enum: ['pending', 'completed'],
    },
    post_date: Date,
    timeline: Date,
}, {
    versionKey: false,
});

// define compound indexes in the schema
requestSchema.index({
    supplier_id: 1,
    status: 1,
});


const Request = mongoose.model('Request', requestSchema);

module.exports = Request;