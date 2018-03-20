"use strict";

require("dotenv").config();

const expect = require("chai").expect;
const supertest = require("supertest");
const host = supertest(process.env.REST_API_HOST);

describe("REST API Test", () => {
    let auth_header;

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
});
