/* eslint-disable eol-last */
/* eslint-disable indent */
const express = require('express');
const Boom = require('boom');
const passport = require('passport');
const logger = require('../config/winston');
const responseFormat = require('../utils/responseFormat');
const {
    Contractor,
} = require('../controllers');

require('../utils/middleware/passport');

function authenticate() {
    return (req, res, next) => {
        passport.authenticate('contractor-jwt', { session: false }, (err, data, info) => {
            if (err || info) {
                logger.error(err || info);
                const { output } = Boom.unauthorized(err || info);
                output.payload.message = info.message;
                return responseFormat.handleError(res, output);
            }
            req.contractor = data;
            next();
        })(req, res, next);
    };
}

const router = express.Router();

router.post('/addRequest', authenticate(), Contractor.addRequest);
router.get('/allRequests', authenticate(), Contractor.requests);
router.get('/deleteRequest', authenticate(), Contractor.deleteRequest);

module.exports = router;