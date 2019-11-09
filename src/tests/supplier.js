/* eslint-disable eol-last */
/* eslint-disable indent */
/* eslint-disable no-undef */
const request = require('supertest');
const { expect } = require('chai');
const faker = require('faker');
const code = require('http-status-codes');
const message = require('../constants/messages');

let host;
let token = null;

before((done) => {
    // this.enableTimeouts(false);
    // eslint-disable-next-line global-require
    host = require('../../bin/www');
    done();
});

after(() => {
    host.close();
});


it('Should register a supplier', (done) => {
    const newSupplier = {
        first_name: faker.name.firstName(),
        last_name: faker.name.lastName(),
        username: 'supplier1',
        password: 'Password1',
        confirm_password: 'Password1',
        type: 'supplier',
    };
    request(host)
        .post('/api/v1/register')
        .send(newSupplier)
        .end((err, res) => {
            if (err) return done(err);
            const { body } = res;
            expect(body).to.be.an('object');
            expect(body).to.have.all.keys(['statusCode', 'status', 'data']);
            expect(body.statusCode).to.eq(code.CREATED);
            expect(body.status).to.eq(message.SUCCESS);
            expect(body.data).to.be.an('object');
            return done();
        });
});

it('Should login a supplier', (done) => {
    const loginUser = {
        username: 'supplier1',
        password: 'Password1',
        type: 'supplier',
    };
    request(host)
        .post('/api/v1/login')
        .send(loginUser)
        .expect(code.OK)
        .end((err, res) => {
            if (err) return done(err);
            const { body } = res;
            token = res.body.data.token;
            expect(body).to.be.an('object');
            expect(body.data).to.be.an('object');
            expect(body.statusCode).to.eq(code.OK);
            expect(token).to.be.not.empty;
            return done();
        });
});

// todo: complete writing all tests