import { AuthService } from "auth/services/AuthServices";
import { Request, Response } from "express";

export class AuthController {
  constructor(private authService: AuthService) {}

  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      const response = await this.authService.login(email, password);

      return res.json(response);
    } catch (error) {
      throw error;
    }
  }
}
