/* eslint-disable no-unused-expressions */
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable eol-last */
/* eslint-disable indent */
/* eslint-disable no-undef */
const request = require('supertest');
const { expect } = require('chai');
const faker = require('faker');
const randomInt = require('random-int');
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


it('Should register a contractor', (done) => {
    const newContractor = {
        firstname: faker.name.firstName(),
        lastname: faker.name.lastName(),
        username: `contractor${randomInt(1, 1000)}`,
        // username: 'contractor1',
        password: 'Password1',
        confirm_password: 'Password1',
        type: 'contractor',
    };
    request(host)
        .post('/api/v1/register')
        .send(newContractor)
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

it('Should login a contractor', (done) => {
    const loginUser = {
        username: 'contractor1',
        password: 'Password1',
        type: 'contractor',
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


it('Should add a new request from the contractor', (done) => {
    const newRequest = {
        machine_name: 'tractor',
        year: 1992,
        model: 'BMW1',
        capacity: '22100',
        location: 'ghana',
        timeline: '2019-12-12',
    };
    request(host)
        .post('/api/v1/contractor/addRequest')
        .set('Authorization', `Bearer ${token}`)
        .send(newRequest)
        .expect(code.OK)
        .end((err, res) => {
            if (err) return done(err);
            const { body } = res;
            expect(body).to.be.an('object');
            expect(body.status).to.eq(message.SUCCESS);
            expect(body.data.message).to.eq(message.OPERATION_SUCCESS);
            return done();
        });
});

// todo: complete writing all tests

it('Should register a supplier', (done) => {
    const newContractor = {
        firstname: faker.name.firstName(),
        lastname: faker.name.lastName(),
        username: `supplier${randomInt(1, 1000)}`,
        // username: 'supplier1',
        password: 'Password1',
        confirm_password: 'Password1',
        type: 'supplier',
    };
    request(host)
        .post('/api/v1/register')
        .send(newContractor)
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