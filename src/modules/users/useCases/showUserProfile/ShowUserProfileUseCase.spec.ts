import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { ICreateUserDTO } from "../createUser/ICreateUserDTO";
import { ShowUserProfileError } from "./ShowUserProfileError";
import { ShowUserProfileUseCase } from "./ShowUserProfileUseCase";

let usersRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;
let showUser: ShowUserProfileUseCase;

describe("User Profile Use Case", () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(usersRepository);
    showUser = new ShowUserProfileUseCase(usersRepository);
  });

  it("should be able to get user profile data", async () => {
    const testData: ICreateUserDTO = {
      name: "test dude",
      email: "test@test.com",
      password: "12345",
    };

    const user = await createUserUseCase.execute(testData);

    const profile = await showUser.execute(user.id as string);

    expect(profile.email).toBe("test@test.com");
  });

  it("should not be able to get user profile with invalid user id", async () => {
    const testData: ICreateUserDTO = {
      name: "test dude",
      email: "test@test.com",
      password: "12345",
    };

    await createUserUseCase.execute(testData);

    expect(async () => {
      await showUser.execute("a1b2c3d4e5");
    }).rejects.toBeInstanceOf(ShowUserProfileError);
  });
});
