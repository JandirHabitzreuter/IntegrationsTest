import request from "supertest";
import { Connection } from "typeorm";

import { app } from "../../../../app";
import createConnection from "../../../../database";

let connection: Connection;

describe("Get Balance Controller", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to get logged user balance", async () => {
    await request(app).post("/api/v1/users").send({
      name: "test dude",
      email: "test@test.com",
      password: "12345",
    });

    const authResponse = await request(app).post("/api/v1/sessions").send({
      email: "test@test.com",
      password: "12345",
    });

    const { token } = authResponse.body;

    await request(app)
      .post("/api/v1/statements/deposit")
      .set({
        Authorization: `Bearer ${token}`,
      })
      .send({ amount: 100, description: "deposit test" });

    await request(app)
      .post("/api/v1/statements/withdraw")
      .set({
        Authorization: `Bearer ${token}`,
      })
      .send({ amount: 20, description: "withdraw test" });

    const balanceRespnse = await request(app)
      .get("/api/v1/statements/balance")
      .set({
        Authorization: `Bearer ${token}`,
      });

    const { balance } = balanceRespnse.body;
    expect(balanceRespnse.status).toBe(200);
    expect(balance).toBe(80);
  });

  it("should not be able to get balance without a valid token", async () => {
    const balanceRespnse = await request(app)
      .get("/api/v1/statements/balance")
      .set({
        Authorization: `Bearer invalid token`,
      });

    const error = balanceRespnse.body;

    expect(balanceRespnse.status).toBe(401);
    expect(error.message).toBe("JWT invalid token!");
  });
});
