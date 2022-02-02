import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { ICreateUserDTO } from "../../../users/useCases/createUser/ICreateUserDTO";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { ICreateStatementDTO } from "../createStatement/ICreateStatementDTO";
import { GetStatementOperationError } from "./GetStatementOperationError";
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase";

let userRepository: InMemoryUsersRepository;
let statementRepository: InMemoryStatementsRepository;
let createStatementUseCase: CreateStatementUseCase;
let createUser: CreateUserUseCase;
let getStatement: GetStatementOperationUseCase;

enum OperationType {
  DEPOSIT = "deposit",
  WITHDRAW = "withdraw",
}

describe("Get Statement Operation Use Case", () => {
  beforeEach(() => {
    userRepository = new InMemoryUsersRepository();
    statementRepository = new InMemoryStatementsRepository();
    createStatementUseCase = new CreateStatementUseCase(
      userRepository,
      statementRepository
    );
    createUser = new CreateUserUseCase(userRepository);
    getStatement = new GetStatementOperationUseCase(
      userRepository,
      statementRepository
    );
  });

  it("should be able to get statement by id", async () => {
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

    const statement = await createStatementUseCase.execute(testData);

    const foundStatement = await getStatement.execute({
      statement_id: statement.id as string,
      user_id: user.id as string,
    });

    expect(foundStatement.id).toEqual(statement.id);
  });

  it("should not be able to get statement with invalid user id", async () => {
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

    const statement = await createStatementUseCase.execute(testData);

    expect(async () => {
      await getStatement.execute({
        statement_id: statement.id as string,
        user_id: "invalid user id",
      });
    }).rejects.toBeInstanceOf(GetStatementOperationError.UserNotFound);
  });

  it("should not be able to get statement with invalid statement id", async () => {
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

    expect(async () => {
      await getStatement.execute({
        statement_id: "invalid statement id",
        user_id: user.id as string,
      });
    }).rejects.toBeInstanceOf(GetStatementOperationError.StatementNotFound);
  });
});
