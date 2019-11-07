/* eslint-disable indent */
/* eslint-disable space-before-function-paren */
/* eslint-disable eol-last */
const passport = require('passport');
const JWTStrategy = require('passport-jwt').Strategy;
const extractJWT = require('passport-jwt').ExtractJwt;
const dotenv = require('dotenv');
const AuthModel = require('../../models/auth');
const SupplierModel = require('../../models/supplier');
const ContractorModel = require('../../models/contractor');


dotenv.config();

passport.use('supplier-jwt', new JWTStrategy({
        secretOrKey: process.env.JWT_SECRET,
        jwtFromRequest: extractJWT.fromAuthHeaderAsBearerToken(),
    },
    // eslint-disable-next-line consistent-return
    // eslint-disable-next-line camelcase
    (async(jwt_payload, done) => {
        // const supplier = await AuthModel.findOne({
        //     id: jwt_payload._id,
        //     username: jwt_payload.username,
        //     type: 'supplier',
        // });
        const supplier = await SupplierModel.findOne({
            id: jwt_payload._id,
        });
        try {
            if (supplier) {
                return done(null, jwt_payload);
            }
            done(null, false);
        } catch (error) {
            done(error, null);
        }
    })));

passport.use('contractor-jwt', new JWTStrategy({
        secretOrKey: process.env.JWT_SECRET,
        jwtFromRequest: extractJWT.fromAuthHeaderAsBearerToken(),
    },
    // eslint-disable-next-line consistent-return
    // eslint-disable-next-line camelcase
    (async(jwt_payload, done) => {
        // const contractor = await AuthModel.findOne({
        //     id: jwt_payload._id,
        //     username: jwt_payload.username,
        //     // type: jwt_payload.type,
        //     type: 'contractor',
        // });
        const contractor = await ContractorModel.findOne({
            id: jwt_payload._id,
        });
        try {
            if (contractor) {
                return done(null, jwt_payload);
            }
            done(null, false);
        } catch (error) {
            done(error, null);
        }
    })));