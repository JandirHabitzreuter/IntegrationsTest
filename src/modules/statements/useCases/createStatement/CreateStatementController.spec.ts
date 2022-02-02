import request from "supertest";
import { Connection } from "typeorm";

import { app } from "../../../../app";
import createConnection from "../../../../database";
import { Statement } from "../../entities/Statement";

let connection: Connection;

describe("Create Statement Controller", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to make a deposit", async () => {
    await request(app).post("/api/v1/users").send({
      name: "test dude",
      email: "test@test.com",
      password: "12345",
    });

    const response = await request(app).post("/api/v1/sessions").send({
      email: "test@test.com",
      password: "12345",
    });

    const { token } = response.body;

    const deposit = await request(app)
      .post("/api/v1/statements/deposit")
      .set({
        Authorization: `Bearer ${token}`,
      })
      .send({ amount: 1, description: "deposit test" });

    const statement: Statement = deposit.body;

    expect(deposit.status).toBe(201);
    expect(statement.type).toBe("deposit");
    expect(statement).toHaveProperty("id");
  });

  it("should not be able to make a deposit without a valid token", async () => {
    const deposit = await request(app)
      .post("/api/v1/statements/deposit")
      .set({
        Authorization: `Bearer invalid token`,
      })
      .send({ amount: 1, description: "deposit test" });

    const error = deposit.body;

    expect(deposit.status).toBe(401);
    expect(error.message).toBe("JWT invalid token!");
  });
});
