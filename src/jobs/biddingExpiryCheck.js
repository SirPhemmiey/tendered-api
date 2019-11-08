/* eslint-disable arrow-body-style */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-console */
/* eslint-disable eol-last */
/* eslint-disable indent */
const { of } = require('await-of');
const logger = require('../config/winston');

const BidModel = require('../models/bid');
const WonBidModel = require('../models/won_bid');
const RequestModel = require('../models/request');

require('dotenv').config();

class Bid {
    static async check() {
        const [requests] = await of(RequestModel.find({ status: 'pending' }));
        // console.log(requests[0].bids)
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
                    console.log('still time')
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
        })

        console.log({ bestBidder })
    }
    static async expiryCheck() {
        const [bids] = await of(BidModel.find({}).populate({
            path: 'request',
            match: {
                status: 'pending',
            },
        }));
        let requests;
        if (typeof bids !== 'undefined' && bids.length > 0) {
            console.log({ bids })
            const arrayOfBids = [];
            let supplier;
            let bidId;
            let bidPrice;
            let requestId;
            const current_date = new Date();
            for (const bid of bids) {
                if (bid.request !== null) {
                    const expire_date = new Date(bid.request.timeline);
                    if (expire_date.getTime() < current_date) {
                        console.log('expired');
                        // time is expired
                    } else {
                        console.log('there is still time');
                        supplier = bid.supplier;
                        bidId = bid._id;
                        bidPrice = bid.bid_price;
                        requestId = bid.request._id;
                        arrayOfBids.push({ supplier, bidId, bidPrice, requestId });
                    }
                } else {
                    requests = null;
                }
            }
            // console.log(arrayOfBids);
            if (requests !== null) {
                const bestSeller = arrayOfBids.reduce((prev, curr) => {
                    return prev.bidPrice < curr.bidPrice ? prev : curr;
                });
                // insert the winner into the db
                await WonBidModel.create({
                    supplier: bestSeller.supplier,
                    bid: bestSeller.bidId,
                    date: new Date(),
                });
                await RequestModel.updateOne({ _id: bestSeller.requestId }, {
                    status: 'completed',
                })
                console.log('done')
            } else {
                console.log('null o')
            }
            // console.log({ bestPrice });
        }
    }
}

module.exports = Bid;