/* eslint-disable eol-last */
/* eslint-disable indent */
const express = require('express');
const Boom = require('boom');
const passport = require('passport');
const logger = require('../config/winston');
const responseFormat = require('../utils/responseFormat');
const {
    Supplier,
} = require('../controllers');

require('../utils/middleware/passport');

function authenticate() {
    return (req, res, next) => {
        passport.authenticate('supplier-jwt', { session: false }, (err, data, info) => {
            if (err || info) {
                logger.error(err || info);
                const { output } = Boom.unauthorized(err || info);
                output.payload.message = info.message;
                return responseFormat.handleError(res, output);
            }
            req.supplier = data;
            next();
        })(req, res, next);
    };
}

const router = express.Router();

router.post('/bid', authenticate(), Supplier.bidRequest);
router.get('/allRequests', authenticate(), Supplier.requests);
router.get('/awardedBids', authenticate(), Supplier.awardedBids);

module.exports = router;