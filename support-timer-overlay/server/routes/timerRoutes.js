import express from "express";

export function createTimerRoutes({ timerService }) {
  const router = express.Router();

  router.get("/", (request, response) => {
    response.json(timerService.getState());
  });

  router.post("/start", (request, response) => {
    timerService.start();
    response.json(timerService.getState());
  });

  router.post("/pause", (request, response) => {
    timerService.pause();
    response.json(timerService.getState());
  });

  router.post("/reset", (request, response) => {
    timerService.reset();
    response.json(timerService.getState());
  });

  return router;
}
