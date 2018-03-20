"use strict";

require("dotenv").config();

const expect = require("chai").expect;
const supertest = require("supertest");
const host = supertest(process.env.LEGACY_API_HOST);

let date = new Date();
let timestamp = date.getTime();

describe("Legacy API Test", () => {
    let api_token;
    let invoice_code;

    it("should be able to login", done => {
        host
            .post("/login")
            .set("clientkey", process.env.LEGACY_API_CLIENTKEY)
            .end((err, res) => {
                expect(res.body.data).to.not.equal(null);

                api_token = res.body.data.token;

                done();
            });
    });

    it("should be able to create order", done => {
        host
            .post("/invoice/create")
            .set("token", api_token)
            .type("application/json")
            .send({
                data: {
                    tickets: [
                        {
                            id_ticket: process.env.LEGACY_API_ID_TICKET,
                            qty: "1"
                        }
                    ],
                    attendee: {
                        firstname: process.env.ATTENDEE_FIRSTNAME,
                        lastname: process.env.ATTENDEE_LASTNAME,
                        email: process.env.ATTENDEE_EMAIL
                    },
                    order_id: "API" + timestamp,
                    expiration_type: "1",
                    notes: "API v2"
                }
            })
            .end((err, res) => {
                expect(res.body.data).to.not.equal(null);
                expect(res.body.message).to.equal(
                    "Invoice created succesfully"
                );

                invoice_code = res.body.data.invoice_code;

                done();
            });
    });

    it("should be able to pay invoice", done => {
        host
            .post("/invoice/" + invoice_code + "/paid")
            .set("token", api_token)
            .type("application/json")
            .send({
                data: {
                    send_email: 0
                }
            })
            .end((err, res) => {
                expect(res.body.data).to.not.equal(null);
                expect(res.body.message).to.equal("Invoice Paid...");
                done();
            });
    });
});
