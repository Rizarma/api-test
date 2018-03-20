"use strict";

require("dotenv").config();

const expect = require("chai").expect;
const supertest = require("supertest");
const host = supertest(process.env.REST_API_HOST);

describe("REST API Test", () => {
    let auth_header;
    let order_token;

    it("should be authenticated", done => {
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
});
