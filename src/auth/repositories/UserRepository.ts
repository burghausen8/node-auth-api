import { User } from "auth/models/UserModel";

export class UserRepository {
  private users: User[] = [
    {
      id: 1,
      email: "admin@email.com",
      password: "123456",
    },
  ];

  async findByEmail(email: string) {
    return this.users.find((user) => user.email === email);
  }
}
