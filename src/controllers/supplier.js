/* eslint-disable eol-last */
/* eslint-disable indent */
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const Boom = require('boom');
const Ajv = require('ajv');
const code = require('http-status-codes');
const logger = require('../config/winston');
const message = require('../constants/messages');

const schema = require('../utils/validators/supplierValidator');
const responseFormat = require('../utils/responseFormat');

const SupplierModel = require('../models/supplier');
const RequestModel = require('../models/request');
const BidModel = require('../models/bid');
const WonBidModel = require('../models/won_bid');


const saltRounds = bcrypt.genSaltSync(10);
dotenv.config();

const { JWT_SECRET: secret } = process.env;

const ajv = Ajv({ allErrors: true, $data: true });
require('ajv-errors')(ajv);


class Supplier {
    /**
     *
     * @description Register a supplier
     * @static
     * @param {object} req Request object
     * @param {object} res REsponse object
     * @returns {object} An object that contains a successful message
     * @memberof Supplier
     */
    static async register(req, res) {
        const validate = ajv.compile(schema.supplierRegistration);
        let data = {};

        // Validate the request or query params
        const valid_schema = validate(req.body);
        if (!valid_schema) {
            logger.error('Ajv Validation Error: %o', ajv.errorsText(validate.errors));
            const { output } = Boom.badRequest(ajv.errorsText(validate.errors));
            return responseFormat.handleError(res, output);
        }
        const {
            username,
            password,
        } = req.body;
        const hash = await bcrypt.hash(password, saltRounds);

        try {
            const foundSupplier = await SupplierModel.findOne({ username }).lean();
            if (foundSupplier) {
                logger.error(message.USERNAME_NOT_FOUND);
                const { output } = Boom.conflict();
                output.payload.message = message.USERNAME_NOT_FOUND;
                return responseFormat.handleError(res, output);
            }

            const newSupplier = await SupplierModel.create({
                username,
                password: hash,
            });
            if (newSupplier) {
                data = {
                    res,
                    status: message.SUCCESS,
                    statusCode: code.CREATED,
                    data: {
                        message: message.ACCOUNT_CREATED,
                    },
                };
                return responseFormat.handleSuccess(res, data);
            }
        } catch (err) {
            logger.error(err);
            const { output } = Boom.badImplementation();
            output.payload.message = err.message;
            return responseFormat.handleError(res, output);
        }
    }

    /**
     *
     * @description Login supplier
     * @static
     * @param {*} req Request object
     * @param {*} res Response object
     * @returns {object} An object with a message and signed token
     * @memberof Supplier
     */
    static async login(req, res) {
        const { username, password } = req.body;
        const validate = ajv.compile(schema.supplierLogin);
        let data = {};

        // Validate the request or query params
        const valid_schema = validate(req.body);
        if (!valid_schema) {
            logger.error('Ajv Validation Error: %o', ajv.errorsText(validate.errors));
            const { output } = Boom.badRequest(ajv.errorsText(validate.errors));
            return responseFormat.handleError(res, output);
        }
        try {
            const supplier = await SupplierModel.findOne({ username }).lean();
            if (supplier) {
                const match = await bcrypt.compare(password, supplier.password);
                if (match) {
                    const token = jwt.sign({
                            id: supplier._id,
                            username: supplier.username,
                        },
                        secret, { expiresIn: '24h' });
                    data = {
                        res,
                        status: message.SUCCESS,
                        statusCode: code.OK,
                        data: {
                            message: 'You are logged in',
                            token,
                        },
                    };
                    return responseFormat.handleSuccess(res, data);
                }
                logger.error(message.WRONG_USERNAME_PASSWORD);
                const { output } = Boom.preconditionFailed();
                output.payload.message = message.WRONG_USERNAME_PASSWORD;
                return responseFormat.handleError(res, output);
            }
            logger.error(message.ACCOUNT_NOT_FOUND);
            const { output } = Boom.badRequest();
            output.payload.message = message.ACCOUNT_NOT_FOUND;
            return responseFormat.handleError(res, output);
        } catch (err) {
            logger.error('Supplier registration error: %o', err);
            const { output } = Boom.badImplementation();
            output.payload.message = err.message;
            return responseFormat.handleError(res, output);
        }
    }

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