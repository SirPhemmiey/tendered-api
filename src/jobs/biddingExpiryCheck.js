/* eslint-disable object-curly-newline */
/* eslint-disable arrow-body-style */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-console */
/* eslint-disable eol-last */
/* eslint-disable indent */
const { of } = require('await-of');
const logger = require('../config/winston');

const WonBidModel = require('../models/won_bid');
const RequestModel = require('../models/request');

require('dotenv').config();

class Bid {
    static async expiryCheck() {
        const [requests] = await of(RequestModel.find({ status: 'pending' }).populate('bids'));
        const current_date = new Date();
        const allExpiredBids = [];
        let supplier;
        let bidId;
        let bidPrice;
        let requestId;
        for (const req of requests) {
            requestId = req._id;
            const bids = req.bids;
            for (const bid of bids) {
                const expire_date = new Date(req.timeline);
                if (expire_date.getTime() < current_date) {
                    console.log('expired');
                    supplier = bid.supplier;
                    bidId = bid._id;
                    bidPrice = bid.bid_price;
                    allExpiredBids.push({ supplier, bidId, bidPrice, requestId });
                } else {
                    logger.debug('there is still time');
                }
            }
        }
        // lowest bid price is considered the best price
        const bestBidder = allExpiredBids.reduce((prev, curr) => {
            return prev.bidPrice < curr.bidPrice ? prev : curr;
        }, []);

        await WonBidModel.create({
            supplier: bestBidder.supplier,
            bid: bestBidder.bidId,
            date: new Date(),
        });
        await RequestModel.updateOne({ _id: bestBidder.requestId }, {
            status: 'completed',
        });

        logger.info('Best Bidder', bestBidder)
    }
}

module.exports = Bid;