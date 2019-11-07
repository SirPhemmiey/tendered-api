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

const schema = require('../utils/validators/authValidator');
const responseFormat = require('../utils/responseFormat');

const AuthModel = require('../models/auth');
const SupplierModel = require('../models/supplier');
const ContractorModel = require('../models/contractor');

const saltRounds = bcrypt.genSaltSync(10);
dotenv.config();

const { JWT_SECRET: secret } = process.env;

const ajv = Ajv({ allErrors: true, $data: true });
require('ajv-errors')(ajv);


class Auth {
    /**
     *
     * @description Register a contractor | supplier
     * @static
     * @param {object} req Request object
     * @param {object} res REsponse object
     * @returns {object} An object that contains a successful message
     * @memberof Contractor
     */
    static async register(req, res) {
        const validate = ajv.compile(schema.register);
        let data = {};
        const userTypes = {
            contractor: ContractorModel,
            supplier: SupplierModel,
        };
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
            type,
            firstname,
            lastname,
        } = req.body;
        const hash = await bcrypt.hash(password, saltRounds);

        try {
            const foundUser = await AuthModel.findOne({ username }).lean();
            if (foundUser) {
                logger.error(message.USERNAME_NOT_FOUND);
                const { output } = Boom.conflict();
                output.payload.message = message.USERNAME_EXIST;
                return responseFormat.handleError(res, output);
            }

            const newAuthUser = await AuthModel.create({
                username,
                password: hash,
                type,
            });
            // this is a faster way instead of using two if conditions
            await userTypes[type].create({
                firstname,
                lastname,
                auth: newAuthUser._id,
            });
            if (newAuthUser) {
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
     * @description Login contractor | supplier
     * @static
     * @param {*} req Request object
     * @param {*} res Response object
     * @returns {object} An object with a message and signed token
     * @memberof Contractor
     */
    static async login(req, res) {
        const { username, password, type } = req.body;
        const validate = ajv.compile(schema.login);
        let data = {};
        const userTypes = {
            contractor: ContractorModel,
            supplier: SupplierModel,
        };
        // Validate the request or query params
        const valid_schema = validate(req.body);
        if (!valid_schema) {
            logger.error('Ajv Validation Error: %o', ajv.errorsText(validate.errors));
            const { output } = Boom.badRequest(ajv.errorsText(validate.errors));
            return responseFormat.handleError(res, output);
        }
        try {
            const foundUser = await AuthModel.findOne({ username, type }).lean();
            if (foundUser) {
                const match = await bcrypt.compare(password, foundUser.password);
                if (match) {
                    const user = await userTypes[type].findOne({ auth: foundUser._id }).lean();
                    const token = jwt.sign({
                            id: user._id,
                            username: foundUser.username,
                            type: foundUser.type,
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
}

module.exports = Auth;