import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { ICreateUserDTO } from "../createUser/ICreateUserDTO";
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase";
import { IncorrectEmailOrPasswordError } from "./IncorrectEmailOrPasswordError";

let usersRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;
let authenticateUser: AuthenticateUserUseCase;

describe("Authenticate User Use Case", () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
    authenticateUser = new AuthenticateUserUseCase(usersRepository);
    createUserUseCase = new CreateUserUseCase(usersRepository);
  });

  it("should be able to authenticate user with email and password", async () => {
    const testData: ICreateUserDTO = {
      name: "test dude",
      email: "test@test.com",
      password: "12345",
    };

    await createUserUseCase.execute(testData);

    const result = await authenticateUser.execute({
      email: "test@test.com",
      password: "12345",
    });

    expect(result).toHaveProperty("token");
  });

  it("should not be able to authenticate user with wrong email", async () => {
    const testData: ICreateUserDTO = {
      name: "test dude",
      email: "test@test.com",
      password: "12345",
    };

    await createUserUseCase.execute(testData);

    expect(async () => {
      await authenticateUser.execute({
        email: "testaaa@test.com",
        password: "12345",
      });
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  });

  it("should not be able to authenticate user with wrong password", async () => {
    const testData: ICreateUserDTO = {
      name: "test dude",
      email: "test@test.com",
      password: "12345",
    };

    await createUserUseCase.execute(testData);

    expect(async () => {
      await authenticateUser.execute({
        email: "test@test.com",
        password: "123456789",
      });
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  });
});
