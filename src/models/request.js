/* eslint-disable eol-last */
/* eslint-disable indent */
const mongoose = require('mongoose');

function validTimeline(e) {
    const d = new Date();
    return e && e > d;
}

const requestSchema = new mongoose.Schema({
    contractor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Contractor',
    },
    machine_name: String,
    year: Number,
    model: String,
    capacity: String,
    location: String,
    status: {
        type: String,
        enum: ['pending', 'completed'],
    },
    post_date: Date,
    timeline: {
        type: Date,
        validate: [validTimeline, 'Value of expired_at should be specified and it must be in a future'],
    },
    bids: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Bid',
    }],
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