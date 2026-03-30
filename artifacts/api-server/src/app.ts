import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import session from "express-session";
import router from "./routes/index.js";
import { logger } from "./lib/logger.js";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return { id: req.id, method: req.method, url: req.url?.split("?")[0] };
      },
      res(res) {
        return { statusCode: res.statusCode };
      },
    },
  }),
);

app.use(cors({ 
  origin: function(origin, callback) {
    // Allow same-origin requests and specific origins
    if (!origin || origin.includes('localhost') || origin.includes('127.0.0.1') || origin.includes('replit.dev')) {
      callback(null, true);
    } else {
      callback(null, true); // Allow all for now
    }
  }, 
  credentials: true 
}));
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));

const sessionSecret = process.env["SESSION_SECRET"];
if (!sessionSecret) {
  throw new Error("SESSION_SECRET environment variable is required");
}

// 1. ADD THIS: Tell Express to trust Replit's HTTPS proxy
app.set("trust proxy", 1);

app.use(
  session({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false, // Prevents creating empty sessions
    cookie: {
      httpOnly: true,
      secure: true,      // 2. FORCE TRUE: Required for Replit's HTTPS
      sameSite: "none",  // 3. FORCE "none": Required for cross-site cookie usage
      maxAge: 7 * 24 * 60 * 60 * 1000,
    },
  }),
);

app.use("/api", router);

export default app;
