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