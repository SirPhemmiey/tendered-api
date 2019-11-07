/* eslint-disable eol-last */
/* eslint-disable indent */
const Boom = require('boom');
const Ajv = require('ajv');
const code = require('http-status-codes');
const logger = require('../config/winston');
const message = require('../constants/messages');

const schema = require('../utils/validators/contractorValidator');
const responseFormat = require('../utils/responseFormat');

const RequestModel = require('../models/request');

const ajv = Ajv({ allErrors: true, $data: true });
require('ajv-errors')(ajv);


class Contractor {
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