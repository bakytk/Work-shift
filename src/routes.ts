const JWT_SECRET: string = process.env.JWT_SECRET || '';
if (!JWT_SECRET) {
  throw new Error("Missing JWT_SECRET token");
}

import express from "express";
const router = express.Router();
router.use(express.json());

import { controllers } from "./controllers";
import { authenticate } from "./auth";

const confirmToken = authenticate(JWT_SECRET);

router.post("/ping", controllers.Ping);
router.post("/register", controllers.Register);
router.post("/login", controllers.Login);

//CRUD shift
router.post("/shift", confirmToken, controllers.CreateShift);
router.get("/shifts/:userId", confirmToken, controllers.GetShifts);
router.put("/shift", confirmToken, controllers.UpdateTime);
router.delete("/shift/:shiftId", confirmToken, controllers.RemoveShift);

router.all("/*", controllers.Fallback);
router.use((error, _, res, __) => {
  console.error(`Processing err: ${error}`);
  return res.status(500).json({ error: "Processing error" });
});

export default router;
