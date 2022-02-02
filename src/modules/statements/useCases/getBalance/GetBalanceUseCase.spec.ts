import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { ICreateUserDTO } from "../../../users/useCases/createUser/ICreateUserDTO";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { ICreateStatementDTO } from "../createStatement/ICreateStatementDTO";
import { GetBalanceError } from "./GetBalanceError";
import { GetBalanceUseCase } from "./GetBalanceUseCase";

let userRepository: InMemoryUsersRepository;
let statementRepository: InMemoryStatementsRepository;
let createStatementUseCase: CreateStatementUseCase;
let createUser: CreateUserUseCase;
let getBalanceUseCase: GetBalanceUseCase;

enum OperationType {
  DEPOSIT = "deposit",
  WITHDRAW = "withdraw",
}

describe("Get Balance Use Case", () => {
  beforeEach(() => {
    userRepository = new InMemoryUsersRepository();
    statementRepository = new InMemoryStatementsRepository();
    createStatementUseCase = new CreateStatementUseCase(
      userRepository,
      statementRepository
    );
    createUser = new CreateUserUseCase(userRepository);
    getBalanceUseCase = new GetBalanceUseCase(
      statementRepository,
      userRepository
    );
  });

  it("should be able to get user balance", async () => {
    const testUser: ICreateUserDTO = {
      name: "test dude",
      email: "test@test.com",
      password: "12345",
    };

    const user = await createUser.execute(testUser);

    const testData: ICreateStatementDTO = {
      amount: 100,
      description: "initial balance",
      user_id: user.id as string,
      type: OperationType.DEPOSIT,
    };

    await createStatementUseCase.execute(testData);

    const balance = await getBalanceUseCase.execute({
      user_id: user.id as string,
    });

    expect(balance).toHaveProperty("balance");
    expect(balance.balance).toBe(100);

    const testData2: ICreateStatementDTO = {
      amount: 50,
      description: "withdraw 50",
      user_id: user.id as string,
      type: OperationType.WITHDRAW,
    };

    await createStatementUseCase.execute(testData2);

    const balance2 = await getBalanceUseCase.execute({
      user_id: user.id as string,
    });

    expect(balance2).toHaveProperty("balance");
    expect(balance2.balance).toBe(50);
  });

  it("should not be able to get balance with invalid user id", async () => {
    expect(async () => {
      await getBalanceUseCase.execute({
        user_id: "invalid user id",
      });
    }).rejects.toBeInstanceOf(GetBalanceError);
  });
});
