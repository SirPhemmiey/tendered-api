/* eslint-disable eol-last */
/* eslint-disable indent */
const supplierController = require('./supplier');
const contractorController = require('./contractor');
const authController = require('./auth');


module.exports = {
    Supplier: supplierController,
    Contractor: contractorController,
    Auth: authController,
};