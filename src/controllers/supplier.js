/* eslint-disable eol-last */
/* eslint-disable indent */
const dotenv = require('dotenv');
const Boom = require('boom');
const Ajv = require('ajv');
const code = require('http-status-codes');
const logger = require('../config/winston');
const message = require('../constants/messages');

const schema = require('../utils/validators/supplierValidator');
const responseFormat = require('../utils/responseFormat');

const RequestModel = require('../models/request');
const BidModel = require('../models/bid');
const WonBidModel = require('../models/won_bid');


dotenv.config();

const ajv = Ajv({ allErrors: true, $data: true });
require('ajv-errors')(ajv);


class Supplier {
    /**
     *
     * @description Bid for a Request
     * @static
     * @param {*} req Request object
     * @param {*} res Response object
     * @returns {object}
     * @memberof Supplier
     */
    static async bidRequest(req, res) {
        const supplier = req.supplier.id;
        const validate = ajv.compile(schema.supplierBid);
        let data = {};

        // Validate the request or query params
        const valid_schema = validate(req.body);
        if (!valid_schema) {
            logger.error('Ajv Validation Error: %o', ajv.errorsText(validate.errors));
            const { output } = Boom.badRequest(ajv.errorsText(validate.errors));
            return responseFormat.handleError(res, output);
        }
        try {
            const {
                request,
                bid_price,
            } = req.body;
            // check if the request has already been completed before
            const findRequest = await RequestModel.findOne({ _id: request });

            if (findRequest.status === 'completed') {
                logger.error('Request already been completed');
                const { output } = Boom.badRequest();
                output.payload.message = 'Request has already been completed. You cannot bid';
                return responseFormat.handleError(res, output);
            }

            const bid = {
                supplier,
                bid_price,
                bid_date: new Date(),
            };

            const savedBid = await BidModel.create(bid);
            await RequestModel.findOneAndUpdate({
                _id: request,
                status: 'pending',
            }, {
                $push: { bids: savedBid._id },
            });
            data = {
                res,
                status: message.SUCCESS,
                statusCode: code.OK,
                data: {
                    message: message.OPERATION_SUCCESS,
                },
            };
            return responseFormat.handleSuccess(res, data);
        } catch (err) {
            logger.error('Supplier Bid Error', err);
            const { output } = Boom.badImplementation();
            output.payload.message = err.message;
            return responseFormat.handleError(res, output);
        }
    }


    static async getRequest(req, res) {
        const request_id = req.params.request_id;
        let data = {};
        try {
            const request = await RequestModel.findOne({ _id: request_id }).lean();
            data = {
                res,
                status: message.SUCCESS,
                statusCode: code.OK,
                data: {
                    request,
                },
            };
            return responseFormat.handleSuccess(res, data);
        } catch (err) {
            logger.error('Get Request Info', err);
            const { output } = Boom.badImplementation();
            output.payload.message = err.message;
            return responseFormat.handleError(res, output);
        }
    }

    /**
     *
     * @description List All Awarded Bid
     * @static
     * @param {*} req Request object
     * @param {*} res Response object
     * @returns {object} object with an array of bids
     * @memberof Supplier
     */
    static async awardedBids(req, res) {
        const supplier = req.supplier.id;
        try {
            let data = {};
            const bids = await WonBidModel.find({ supplier }).populate('bid');
            data = {
                res,
                status: message.SUCCESS,
                statusCode: code.OK,
                data: {
                    bids,
                },
            };
            return responseFormat.handleSuccess(res, data);
        } catch (err) {
            logger.error('List Awarded Bids Error', err);
            const { output } = Boom.badImplementation();
            output.payload.message = err.message;
            return responseFormat.handleError(res, output);
        }
    }

    /**
     *
     * @description List All Available Requests
     * @static
     * @param {*} req Request object
     * @param {*} res Response object
     * @returns {object} object with an array of requests
     * @memberof Supplier
     */
    static async liveRequests(req, res) {
        try {
            let data = {};
            const requests = await RequestModel.find({ status: { $ne: 'completed' } }).select('-contractor -__v -createdAt -updatedAt');
            data = {
                res,
                status: message.SUCCESS,
                statusCode: code.OK,
                data: {
                    requests,
                },
            };
            return responseFormat.handleSuccess(res, data);
        } catch (err) {
            logger.error('List Requests Error', err);
            const { output } = Boom.badImplementation();
            output.payload.message = err.message;
            return responseFormat.handleError(res, output);
        }
    }

    /**
     *
     * @description Search the list of Requests
     * @static
     * @param {*} req Request object
     * @param {*} res Response object
     * @returns {object} object with an array of requests
     * @memberof Supplier
     */
    static async searchRequsts(req, res) {

    }
}

module.exports = Supplier;