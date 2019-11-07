/* eslint-disable eol-last */
/* eslint-disable indent */
const mongoose = require('mongoose');
const logger = require('../config/winston');
require('dotenv').config();

mongoose.promise = global.promise;
mongoose.connect(process.env.MONGO_URL, {
        keepAlive: true,
        useNewUrlParser: true,
        useCreateIndex: true,
        useUnifiedTopology: true,
    })
    .then(() => {
        logger.debug('MongoDB is connected');
    })
    .catch((err) => {
        logger.error(err);
        logger.debug('MongoDB connection unsuccessful.');
    });