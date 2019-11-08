/* eslint-disable eol-last */
/* eslint-disable indent */
const mongoose = require('mongoose');

const bidSchema = new mongoose.Schema({
    supplier: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Supplier',
    },
    bid_date: {
        type: Date,
    },
    bid_price: {
        type: 'string',
    },
}, {
    versionKey: false,
});

// define compound indexes in the schema
bidSchema.index({
    supplier: 1,
});


const Bid = mongoose.model('Bid', bidSchema);

module.exports = Bid;