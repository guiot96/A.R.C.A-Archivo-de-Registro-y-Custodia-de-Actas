import { Router, type IRouter } from "express";
import healthRouter from "./health";
import actasRouter from "./actas";
import detectionRouter from "./detection";

const router: IRouter = Router();

router.use(healthRouter);
router.use(actasRouter);
router.use(detectionRouter);

export default router;
