// import jwt from "jsonwebtoken";
// import { UserRepository } from "../repositories/UserRepository";
// import { jwtConfig } from "config/jwt";
// import { AppError } from "shared/errors/AppError";

// export class AuthService {
//   constructor(private userRepository: UserRepository) {}

//   async login(email: string, password: string) {
//     const user = await this.userRepository.findByEmail(email);

//     if (!user) {
//       throw new AppError("Invalid credentials", 401);
//     }

//     if (user.password !== password) {
//       throw new AppError("Invalid credentials", 401);
//     }

//     const token = jwt.sign(
//       {
//         id: user.id,
//         email: user.email,
//       },
//       jwtConfig.secret,
//       {
//         expiresIn: "1h",
//       }
//     );

//     return {
//       token,
//     };
//   }
// }
