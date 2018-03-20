"use strict";

require("dotenv").config();

const expect = require("chai").expect;
const supertest = require("supertest");
const host = supertest(process.env.REST_API_HOST);

describe("REST API Test", () => {
    let auth_header;
    let order_token;
    let order_id_attendee;
    let order_invoice_payment_total;
    let order_status_invoice_name;

    it("should be able to authenticate", done => {
        host
            .get(
                "/authentication/generate?client_id=" +
                    process.env.REST_API_CLIENT_ID +
                    "&client_secret=" +
                    process.env.REST_API_CLIENT_SECRET
            )
            .end((err, res) => {
                expect(res.body.result.hmac.Authorization.header).to.not.equal(
                    null
                );
                auth_header = res.body.result.hmac.Authorization.header;
                done();
            });
    });

    it("should be able to create order", done => {
        host
            .post("/order/create")
            .set("Authorization", auth_header)
            .send({
                notes: "Remote REST API",
                expired_minutes: 240
            })
            .end((err, res) => {
                expect(res.body.result.token).to.not.equal(null);
                order_token = res.body.result.token;
                done();
            });
    });

    it("should be able to book order", done => {
        host
            .post("/order/book")
            .set("Authorization", auth_header)
            .send({
                id_ticket: process.env.REST_API_ID_TICKET,
                qty: 1,
                token: order_token
            })
            .end((err, res) => {
                expect(res.body.result.id_invoice).to.not.equal(null);
                expect(res.body.result.id_order).to.not.equal(null);
                expect(res.body.result.invoice_code).to.not.equal(null);
                expect(res.body.result.tickets[0].id_transaction).to.not.equal(
                    null
                );
                expect(res.body.result.attendees[0].id_attendee).to.not.equal(
                    null
                );
                order_id_attendee = res.body.result.attendees[0].id_attendee;
                done();
            });
    });

    it("should be able to assign attendee", done => {
        host
            .post("/order/attendee")
            .set("Authorization", auth_header)
            .send({
                token: order_token,
                id_attendee: order_id_attendee,
                firstname: process.env.ATTENDEE_FIRSTNAME,
                lastname: process.env.ATTENDEE_LASTNAME,
                email: process.env.ATTENDEE_EMAIL,
                telephone: process.env.ATTENDEE_TELEPHONE,
                identity_id: process.env.ATTENDEE_IDENTITY_ID,
                gender: process.env.ATTENDEE_GENDER,
                dob: process.env.ATTENDEE_DOB
            })
            .end((err, res) => {
                expect(res.body.result.id_invoice).to.not.equal(null);
                expect(res.body.result.id_order).to.not.equal(null);
                expect(res.body.result.invoice_code).to.not.equal(null);
                expect(res.body.result.tickets[0].id_transaction).to.not.equal(
                    null
                );
                expect(res.body.result.attendees[0].id_attendee).to.not.equal(
                    null
                );
                done();
            });
    });

    it("should be able to get payment rates", done => {
        host
            .get(
                "/order?token=" +
                    order_token +
                    "&id_list_payment=" +
                    process.env.PAYMENT_CASH
            )
            .set("Authorization", auth_header)
            .end((err, res) => {
                expect(
                    res.body.result.invoice.invoice_payment_total
                ).to.not.equal(null);
                order_invoice_payment_total =
                    res.body.result.invoice.invoice_payment_total;
                done();
            });
    });

    it("should be able to confirm order", done => {
        host
            .post("/order/confirm")
            .set("Authorization", auth_header)
            .send({
                token: order_token,
                id_list_payment: 21,
                price_total: order_invoice_payment_total,
                send_email: 0
            })
            .end((err, res) => {
                expect(res.body.result.id_invoice).to.not.equal(null);
                expect(res.body.result.id_order).to.not.equal(null);
                expect(res.body.result.invoice_code).to.not.equal(null);
                expect(res.body.result.status_invoice_name).to.not.equal(null);
                order_status_invoice_name = res.body.result.status_invoice_name;
                done();
            });
    });
});
