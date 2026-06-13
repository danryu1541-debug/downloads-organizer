import express from "express";

export function createTestRoutes({ donationQueue }) {
  const router = express.Router();

  router.post("/support", (request, response) => {
    const result = donationQueue.enqueue({
      supporterName: request.body.supporterName || "테스트 후원자",
      amount: Number(request.body.amount || 1000),
      message: request.body.message || "테스트 이벤트"
    });
    response.json(result);
  });

  return router;
}
