/* eslint-disable eol-last */
/* eslint-disable space-before-function-paren */
/* eslint-disable indent */
const Agenda = require('agenda');
const Agendash = require('agendash');
const dotenv = require('dotenv');
const logger = require('../config/winston');
const biddingCheckJob = require('./biddingExpiryCheck');

dotenv.config();

const agenda = new Agenda({ db: { address: process.env.MONGO_URL } });

agenda.define('Request Bid Expiry check', {}, async(job, done) => {
    try {
        await biddingCheckJob.expiryCheck();
        done();
    } catch (e) {
        logger.error(e.stack);
    }
});

async function start() {
    await agenda.start();
    logger.info('agenda is running');
    await agenda.every('1 second', 'Request Bid Expiry check');
}

function graceful() {
    logger.debug('Something is gonna blow up.');
    agenda.stop(() => {
        process.exit(0);
    });
}

process.on('SIGTERM', graceful);
process.on('SIGINT', graceful);

module.exports = start;