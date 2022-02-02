import request from "supertest";
import { Connection } from "typeorm";

import { app } from "../../../../app";
import createConnection from "../../../../database";
import { Statement } from "../../entities/Statement";

let connection: Connection;

describe("Get Statement Operation Controller", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to get a statement with id", async () => {
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

    const fakeStatementResponse = await request(app)
      .post("/api/v1/statements/deposit")
      .set({
        Authorization: `Bearer ${token}`,
      })
      .send({ amount: 100, description: "deposit test" });

    const fakeStatement: Statement = fakeStatementResponse.body;

    const statementResponse = await request(app)
      .get(`/api/v1/statements/${fakeStatement.id}`)
      .set({
        Authorization: `Bearer ${token}`,
      });

    const gotStatement: Statement = statementResponse.body;

    expect(statementResponse.status).toBe(200);
    expect(gotStatement).toHaveProperty("id");
    expect(gotStatement.id).toEqual(fakeStatement.id);
  });

  it("should not be able to get statement without a valid token", async () => {
    const statementResponse = await request(app)
      .get("/api/v1/statements/balance")
      .set({
        Authorization: `Bearer invalid token`,
      });

    const error = statementResponse.body;

    expect(statementResponse.status).toBe(401);
    expect(error.message).toBe("JWT invalid token!");
  });
});
