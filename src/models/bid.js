/* eslint-disable eol-last */
/* eslint-disable indent */
const mongoose = require('mongoose');

const bidSchema = new mongoose.Schema({
    supplier_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Supplier',
    },
    contractor_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Contractor',
    },
    request_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Request',
    },
    bid_date: {
        type: Date,
    },
}, {
    // toJSON: true,
    timestamps: true,
});

// define compound indexes in the schema
bidSchema.index({
    supplier_id: 1,
    contractor_id: 1,
    request_id: 1,
});


const Bid = mongoose.model('Bid', bidSchema);

module.exports = Bid;