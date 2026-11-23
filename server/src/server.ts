import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import { profileRouter } from "./routes/profile";
import { planRouter } from "./routes/plan";
import { requireAuth } from "./middleware/requireAuth";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(cookieParser());
app.use(express.json());

//API Routes
app.use("/api/profile", requireAuth, profileRouter);
app.use("/api/plan", requireAuth, planRouter);

app.listen(PORT, () => console.log(`Server is running on ${PORT}`));
