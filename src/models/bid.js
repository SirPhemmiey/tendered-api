/* eslint-disable eol-last */
/* eslint-disable indent */
const mongoose = require('mongoose');

const bidSchema = new mongoose.Schema({
    supplier: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Supplier',
    },
    contractor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Contractor',
    },
    request: {
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
    supplier: 1,
    contractor: 1,
    request: 1,
});


const Bid = mongoose.model('Bid', bidSchema);

module.exports = Bid;