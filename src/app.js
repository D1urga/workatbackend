import express from "express";
import cors from "cors";

const app = express();

app.use(express.json());
app.use(
  cors({
    origin: true,
    credentials: true,
    exposedHeaders: ["Set-Cookie"],
  })
);

app.get("/hello", (req, res) => {
  res.json({ data: "anoop kumar" });
});

import userRouter from "./routes/user.routes.js";

app.use("/api/v1/user", userRouter);

export { app };
