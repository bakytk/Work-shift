import express from "express";
const router = express.Router();

import bodyParser from "body-parser";
router.use(bodyParser.json());

import { controllers } from "./controllers";

router.post("/ping", controllers.Ping);
router.post("/register", controllers.Register);
//router.post("/login", controllers.Login);

router.all("/*", controllers.Fallback);
router.use((error, _, res, __) => {
  console.error(`Processing err: ${error}`);
  return res.status(500).json({ error: "Processing error" });
});

export default router;
