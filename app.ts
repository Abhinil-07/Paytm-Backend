import express, { Application } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app: Application = express();

//middlewares
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());
const corsOptions = {
  origin: "http://localhost:5173",
  credentials: true,
};

app.use(cors(corsOptions));

//router imports
import accountRouter from "./routes/account.routes";
import userRouter from "./routes/user.routes";

app.use("/api/v1/accounts", accountRouter);
app.use("/api/v1/users", userRouter);

export { app };
