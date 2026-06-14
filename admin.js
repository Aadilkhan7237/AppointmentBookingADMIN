import express from "express"
const app = express();
import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
const MONGO_URL = process.env.MONGO_URL;
const PORT = process.env.PORT || 5004;
import { adminAppointmentRouter } from "./routes/appointment.route.js";
import cookieParser from "cookie-parser";
import { adminUserRouter } from "./routes/user.route.js";
import { adminRouter } from "./routes/admin.route.js";
import { authMiddleware } from "./utils/authMiddleware.js";
import cors from "cors";
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());




const corsOptions = {
  origin: [
    process.env.DASHBOARD_URL,
    process.env.DASHBOARD_URL_PORT,
  ],
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
};

app.use(cors(corsOptions));

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});


// simple health check
app.get("/health", (req, res) => res.status(200).json({ message: 'Working' }));


app.use("/appointments", authMiddleware, adminAppointmentRouter);
app.use("/users", authMiddleware, adminUserRouter);
app.use("/admin", adminRouter);






mongoose.connect(MONGO_URL)
  .then(() => {
    console.log("Admin DB connected");
    app.listen(PORT, () => {
      console.log(`Admin services listening on PORT ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB:", err.message);
    process.exit(1);
  });