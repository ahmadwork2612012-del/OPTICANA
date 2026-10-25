import { Router } from "express";

const router = Router();

router.get("/health", (req, res) => {
  res.json({
    success: true,
    data: {
      service: "opticana-api",
      status: "ok",
      // Which commit is live (set by Vercel for Git deployments), to tell a
      // stale deployment apart from a code problem.
      version: (process.env.VERCEL_GIT_COMMIT_SHA || "local").slice(0, 7),
      timestamp: new Date().toISOString(),
    },
  });
});

export default router;
