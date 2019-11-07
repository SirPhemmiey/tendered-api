/* eslint-disable eol-last */
/* eslint-disable indent */
const mongoose = require('mongoose');

const wonBidSchema = new mongoose.Schema({
    supplier: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Supplier',
    },
    bid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Bid',
    },
    date: {
        type: Date,
    },
}, {
    versionKey: false,
});

// define compound indexes in the schema
wonBidSchema.index({
    supplier: 1,
    bids: 1,
});


const WonBid = mongoose.model('WonBid', wonBidSchema);

module.exports = WonBid;