import { decode } from "jsonwebtoken";
import request from "supertest";
import { Connection } from "typeorm";

import { app } from "../../../../app";
import createConnection from "../../../../database";

let connection: Connection;

describe("Authenticate User Controller", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to authenticate user with email and password", async () => {
    await request(app).post("/api/v1/users").send({
      name: "test dude",
      email: "test@test.com",
      password: "12345",
    });

    const response = await request(app).post("/api/v1/sessions").send({
      email: "test@test.com",
      password: "12345",
    });

    const { user, token } = response.body;
    const decoded = decode(token);

    expect(user).toHaveProperty("id");
    expect(decoded).toHaveProperty("iat");
  });

  it("should not be able to authenticate with invalid password", async () => {
    const response = await request(app).post("/api/v1/sessions").send({
      email: "test@test.com",
      password: "1234",
    });

    const { message } = response.body;

    expect(response.status).toBe(401);
    expect(message).toBe("Incorrect email or password");
  });

  it("should not be able to authenticate with invalid user", async () => {
    const response = await request(app).post("/api/v1/sessions").send({
      email: "dude@test.com",
      password: "12345",
    });

    const { message } = response.body;

    expect(response.status).toBe(401);
    expect(message).toBe("Incorrect email or password");
  });
});
