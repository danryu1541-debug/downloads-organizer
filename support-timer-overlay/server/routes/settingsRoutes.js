import express from "express";

export function createSettingsRoutes({ settingsService, timerService }) {
  const router = express.Router();

  router.get("/", (request, response) => {
    response.json(settingsService.get());
  });

  router.put("/", async (request, response, next) => {
    try {
      const settings = await settingsService.save(request.body);
      timerService.publish();
      response.json(settings);
    } catch (error) {
      next(error);
    }
  });

  return router;
}
