/* eslint-disable eol-last */
/* eslint-disable indent */
const express = require('express');
const {
    Auth,
} = require('../controllers');


const router = express.Router();

router.post('/register', Auth.register);
router.post('/login', Auth.login);

module.exports = router;