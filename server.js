/* eslint-disable func-call-spacing */
/* eslint-disable space-before-function-paren */
/* eslint-disable eol-last */
/* eslint-disable indent */
/* eslint-disable import/no-extraneous-dependencies */
require('dotenv').config();
const express = require('express');
const compression = require('compression');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const rateLimit = require('express-rate-limit');
const bugsnag = require('@bugsnag/js');
const bugsnagExpress = require('@bugsnag/plugin-express');
const cors = require('cors');
const { errorHandler } = require('./src/utils/middleware/error');
const logger = require('./src/config/winston');
const code = require('./src/constants/codes');
const message = require('./src/constants/messages');
const agendaStart = require('./src/jobs/agenda');
const supplierRoute = require('./src/routes/supplierRoute');
const contractorRoute = require('./src/routes/contractorRoute');
const route = require('./src/routes');


require('./src/utils/database');

const bugsnagClient = bugsnag(process.env.BUGSNAG_API_KEY);
bugsnagClient.use(bugsnagExpress);

const middleware = bugsnagClient.getPlugin('express');


const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // start blocking after 100 requests
    message: 'Too many accounts created from this IP, please try again after 15 minutes',
});

const app = express();


// It can only capture errors in downstream middleware
app.use(middleware.requestHandler);

// This handles any errors that Express catches
app.use(middleware.errorHandler);

app.use(cors());
app.options('*', cors());
app.use(helmet());
app.use(apiLimiter);
app.use(morgan('combined', { stream: logger.stream }));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(compression());

/** Application Routes */
app.use('/api/v1/supplier', supplierRoute);
app.use('/api/v1/contractor', contractorRoute);
app.use('/api/v1', route);

/** Catch errors handler */
app.use(errorHandler);


// catch 404 and forward to error handler
app.use((req, res, next) => {
    const errorObj = {
        statusCode: code.NOT_FOUND,
        status: message.ERROR,
        message: message.ROUTE_NOT_FOUND,
    };
    res.status(errorObj.statusCode).json(errorObj);
});

process.on('SIGINT', () => {
    logger.debug('\nGracefully shutting down from SIGINT (Ctrl-C)');
    // some other closing procedures go here
    process.exit(1);
});

// (async() => {
//     await agendaStart();
// })
// ();
module.exports = app;