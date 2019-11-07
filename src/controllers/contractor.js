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

const schema = require('../utils/validators/contractorValidator');
const responseFormat = require('../utils/responseFormat');

const ContractorModel = require('../models/contractor');
const RequestModel = require('../models/request');


const saltRounds = bcrypt.genSaltSync(10);
dotenv.config();

const { JWT_SECRET: secret } = process.env;

const ajv = Ajv({ allErrors: true, $data: true });
require('ajv-errors')(ajv);


class Contractor {
    /**
     *
     * @description Register a contractor
     * @static
     * @param {object} req Request object
     * @param {object} res REsponse object
     * @returns {object} An object that contains a successful message
     * @memberof Contractor
     */
    static async register(req, res) {
        const validate = ajv.compile(schema.contractorRegistration);
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
            const foundContractor = await ContractorModel.findOne({ username }).lean();
            if (foundContractor) {
                logger.error(message.USERNAME_NOT_FOUND);
                const { output } = Boom.conflict();
                output.payload.message = message.USERNAME_NOT_FOUND;
                return responseFormat.handleError(res, output);
            }

            const newContractor = await ContractorModel.create({
                username,
                password: hash,
            });
            if (newContractor) {
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
     * @description Login contractor
     * @static
     * @param {*} req Request object
     * @param {*} res Response object
     * @returns {object} An object with a message and signed token
     * @memberof Contractor
     */
    static async login(req, res) {
        const { username, password } = req.body;
        const validate = ajv.compile(schema.contractorLogin);
        let data = {};

        // Validate the request or query params
        const valid_schema = validate(req.body);
        if (!valid_schema) {
            logger.error('Ajv Validation Error: %o', ajv.errorsText(validate.errors));
            const { output } = Boom.badRequest(ajv.errorsText(validate.errors));
            return responseFormat.handleError(res, output);
        }
        try {
            const contractor = await ContractorModel.findOne({ username }).lean();
            if (contractor) {
                const match = await bcrypt.compare(password, contractor.password);
                if (match) {
                    const token = jwt.sign({
                            id: contractor._id,
                            username: contractor.username,
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
            logger.error('Contractor registration error: %o', err);
            const { output } = Boom.badImplementation();
            output.payload.message = err.message;
            return responseFormat.handleError(res, output);
        }
    }

    /**
     *
     * @description Add New Request
     * @static
     * @param {*} req Request object
     * @param {*} res Response object
     * @returns {object}
     * @memberof Contractor
     */
    static async addRequest(req, res) {
        const validate = ajv.compile(schema.contractorAddRequest);
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
            machine_name,
            year,
            model,
            capacity,
            location,
            timeline,
        } = req.body;
        const newRequest = await RequestModel.create({
            contractor,
            machine_name,
            year,
            model,
            capacity,
            location,
            status: 'pending',
            post_date: new Date(),
            timeline,
        });
        if (newRequest) {
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
     * @description Delete Request
     * @static
     * @param {*} req Request object
     * @param {*} res Response object
     * @returns {object}
     * @memberof Contractor
     */
    static async deleteRequest(req, res) {
        const contractor = req.contractor.id;
        const request_id = req.body.request_id;
        try {
            let data = {};
            const deleteUser = await RequestModel.deleteOne({ contractor, _id: request_id });
            if (deleteUser) {
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
        } catch (err) {
            logger.error('Request Delete Error', err);
            const { output } = Boom.badImplementation();
            output.payload.message = err.message;
            return responseFormat.handleError(res, output);
        }
    }

    /**
     *
     * @description List All Requests (Pending | Completed)
     * @static
     * @param {*} req Request object
     * @param {*} res Response object
     * @returns {object} object with an array of requests
     * @memberof Contractor
     */
    static async requests(req, res) {
        const status = req.body.status;
        const contractor = req.contractor.id;
        try {
            let data = {};
            const requests = await RequestModel.find({ contractor, status });
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

module.exports = Contractor;