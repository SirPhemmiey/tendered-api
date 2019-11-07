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
        const validate = ajv.compile(schema.supplierBid);
        let data = {};

        // Validate the request or query params
        const valid_schema = validate(req.body);
        if (!valid_schema) {
            logger.error('Ajv Validation Error: %o', ajv.errorsText(validate.errors));
            const { output } = Boom.badRequest(ajv.errorsText(validate.errors));
            return responseFormat.handleError(res, output);
        }
        const {
            contractor,
            supplier,
            request,
        } = req.body;
        const newBid = await BidModel.create({
            contractor,
            supplier,
            request,
            bid_date: new Date(),
        });
        if (newBid) {
            data = {
                res,
                status: message.SUCCESS,
                statusCode: code.OK,
                data: {
                    message: message.OPERATION_SUCCESS,
                },
            };
            return responseFormat.handleSuccess(res, data);
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
    static async requests(req, res) {
        try {
            let data = {};
            const requests = await RequestModel.find({});
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
}

module.exports = Supplier;