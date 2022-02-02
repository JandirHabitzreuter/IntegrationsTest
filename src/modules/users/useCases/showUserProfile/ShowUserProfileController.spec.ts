import request from "supertest";
import { Connection } from "typeorm";

import { app } from "../../../../app";
import createConnection from "../../../../database";

let connection: Connection;

describe("Show User Profile Controller", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should not be able to show profile without authentication", async () => {
    const response = await request(app).get("/api/v1/profile");

    const { message } = response.body;

    expect(response.status).toBe(401);
    expect(message).toBe("JWT token is missing!");
  });

  it("should be able to show loged user profile info", async () => {
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

    const profile = await request(app)
      .get("/api/v1/profile")
      .set({
        Authorization: `Bearer ${token}`,
      });

    const { id, email } = profile.body;

    expect(id).toBe(user.id);
    expect(email).toBe(email);
  });

  it("should not be able to show profile with invalid token", async () => {
    const response = await request(app).post("/api/v1/sessions").send({
      email: "test@test.com",
      password: "12345",
    });

    const { user, token } = response.body;

    const profile = await request(app)
      .get("/api/v1/profile")
      .set({
        Authorization: `Bearer ${token}123`,
      });

    const { message } = profile.body;

    expect(profile.status).toBe(401);
    expect(message).toBe("JWT invalid token!");
  });
});
