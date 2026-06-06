import { Router } from "express";
import { getAIInsights } from "../controllers/aiControllers";
import { requireAuth } from "../middleware/authMiddleware";

const router = Router();

router.get("/insights", requireAuth, getAIInsights);

export default router;
