import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import cors from "cors";

import { adminAppointmentRouter } from "./routes/appointment.route.js";
import { adminUserRouter } from "./routes/user.route.js";
import { adminRouter } from "./routes/admin.route.js";
import { authMiddleware } from "./utils/authMiddleware.js";

dotenv.config();

const app = express();

const PORT = process.env.PORT || 5004;
const MONGO_URL = process.env.MONGO_URL;

// ======================================================
// Middleware
// ======================================================

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(
  cors({
    origin: [
      process.env.DASHBOARD_URL,
      process.env.DASHBOARD_URL_PORT,
    ],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use((req, res, next) => {
  console.log(
    `[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`
  );

  next();
});

// ======================================================
// Health / Liveness
// ======================================================

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    service: "Admin Service",
    timestamp: new Date().toISOString(),
  });
});

// ======================================================
// Root
// ======================================================

// app.get("/", (req, res) => {
//   res.status(200).json({
//     status: "ok",
//     service: "Admin Service",
//   });
// });

// ======================================================
// Routes
// ======================================================

app.use(
  "/appointments",
  authMiddleware,
  adminAppointmentRouter
);

app.use(
  "/users",
  authMiddleware,
  adminUserRouter
);

app.use("/admin", adminRouter);

// ======================================================
// Start Server
// ======================================================

const startServer = async () => {
  try {
    await mongoose.connect(MONGO_URL);
    console.log("Admin DB connected");
  } catch (error) {
    console.error(
      "MongoDB connection failed:",
      error.message
    );

    process.exit(1);
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(
      `Admin service listening on port ${PORT}`
    );
  });
};

startServer();
