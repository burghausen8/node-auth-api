import { AuthController } from "auth/controllers/AuthController";
import { UserRepository } from "auth/repositories/UserRepository";
import { AuthService } from "auth/services/AuthServices";
import { Router } from "express";

const router = Router();

const repository = new UserRepository();
const service = new AuthService(repository);
const controller = new AuthController(service);

router.post("/login", controller.login.bind(controller));
export default router;
