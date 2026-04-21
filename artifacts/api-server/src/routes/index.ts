import { Router, type IRouter } from "express";
import healthRouter from "./health";
import certificatesRouter from "./certificates";
import usersRouter from "./users";
import applicationsRouter from "./applications";
import authRouter from "./auth";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/certificates", certificatesRouter);
router.use("/users", usersRouter);
router.use("/applications", applicationsRouter);
router.use("/auth", authRouter);

export default router;
