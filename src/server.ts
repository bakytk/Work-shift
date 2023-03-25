import dotenv from "dotenv";
dotenv.config();

const SERVER_PORT: number = Number(process.env.SERVER_PORT) || 15500;

import express, { Application, Request, Response } from "express";
//import router from "./routes";

const app: Application = express();
//app.use("/", router);

app.listen(SERVER_PORT, async () => {
  console.log(`Server running on port: ${SERVER_PORT}`);
});

export default app;
