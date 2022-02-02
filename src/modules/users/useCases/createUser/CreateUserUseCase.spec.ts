import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository"
import { CreateUserError } from "./CreateUserError";
import { CreateUserUseCase } from "./CreateUserUseCase";

let usersRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;

describe("Create User Use Case",()=>{
  beforeEach(()=>{
    usersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(usersRepository);
  });

  it("should be able to create new user",async () => {
    const user = await createUserUseCase.execute({
      name:"test dude",
      email: "test@test.com",
      password: "12345"
    })
    expect(user).toHaveProperty("id");
  });

  it("should not be able to create new user with same email", async () => {
    expect(async () => {
      await createUserUseCase.execute({
        name:"test dude",
        email: "test@test.com",
        password: "12345"
      });
      await createUserUseCase.execute({
        name:"test dude",
        email: "test@test.com",
        password: "12345"
      });
    }).rejects.toBeInstanceOf(CreateUserError);
  })
})
