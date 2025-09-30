import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import authRoutes from "./routes/authRoutes";
import eventRoutes from "./routes/eventRoutes";
import transactionRoutes from "./routes/transaction.router";
import statsRoutes from "./routes/stats.router";
import attendeesRoutes from "./routes/attendees.router";
import reviewRoutes from "./routes/review.router";

const app = express();

// Security middleware
app.use(helmet());

// Rate limiting
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 100, // limit each IP to 100 requests per windowMs
// });
// app.use(limiter);

// CORS
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  }),
);

// Logging
app.use(morgan("combined"));

// Body parsing
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get("/health", (req: Request, res: Response) => {
  res.json({ status: "OK", message: "Server is running!" });
});

// Routes
app.use("/api/auth", authRoutes);

// Event routes
app.use("/api/events", eventRoutes);

// Transaction routes
app.use("/api/transactions", transactionRoutes);

// Stats routes
app.use("/api/stats", statsRoutes);

// Attendees routes
app.use("/api/attendees", attendeesRoutes);

// Review routes
app.use("/api/reviews", reviewRoutes);

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    message: "Something went wrong!",
    error: process.env.NODE_ENV === "development" ? err.message : {},
  });
});

// 404 handler
app.use("*", (req: Request, res: Response) => {
  res.status(404).json({ message: "Route not found" });
});

export default app;
