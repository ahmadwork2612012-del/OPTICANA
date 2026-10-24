import express from "express";

import cors from "cors";

import helmet from "helmet";

import morgan from "morgan";
import path from "node:path";

import { env } from "./config/env.js";

import apiRouter from "./routes/index.js";

import {
  errorHandler,
  notFoundHandler,
} from "./middleware/errorHandler.js";


const app =
  express();


app.disable(
  "x-powered-by"
);


/* =====================================
   SECURITY
===================================== */

app.use(
  helmet({
    crossOriginResourcePolicy:
      false,
  })
);


/* =====================================
   CORS
===================================== */

app.use(
  cors({
    origin:
      env.CORS_ORIGIN
        .split(",")
        .map(
          (origin) =>
            origin.trim()
        )
        .filter(Boolean),

    credentials:
      true,
  })
);


/* =====================================
   BODY PARSERS
===================================== */

/*
  Product images are uploaded directly from the browser to R2 storage, so
  public endpoints only ever receive small JSON bodies. Authenticated staff
  routes keep a larger limit for the local-disk image fallback used in
  development (base64 images inside JSON). A body parsed by the first
  matching parser is skipped by the later ones.
*/

const STAFF_BODY_LIMIT = "15mb";
const PUBLIC_BODY_LIMIT = "100kb";

app.use(
  ["/api/admin", "/api/categories/admin"],
  express.json({
    limit: STAFF_BODY_LIMIT,
  })
);


app.use(
  express.json({
    limit: PUBLIC_BODY_LIMIT,
  })
);


app.use(
  express.urlencoded({
    extended: false,
    limit: PUBLIC_BODY_LIMIT,
  })
);


/* =====================================
   LOGGING
===================================== */

app.use(
  morgan(
    env.NODE_ENV ===
      "production"
      ? "combined"
      : "dev"
  )
);


/* =====================================
   ROOT
===================================== */

app.get(
  "/",
  (req, res) => {
    res.json({
      success:
        true,

      data: {
        name:
          "OPTICANA API",

        version:
          "1.0.0",
      },
    });
  }
);


/* =====================================
   MEDIA
===================================== */

const mediaBasePath = String(env.MEDIA_BASE_URL || "/uploads").replace(/\/+$/, "") || "/uploads";
const mediaStoragePath = path.resolve(env.MEDIA_STORAGE_DIR || path.join(process.cwd(), "uploads"));

if (mediaBasePath.startsWith("/")) {
  app.use(mediaBasePath, express.static(mediaStoragePath, {
    fallthrough: true,
    maxAge: "7d",
  }));
}

/* =====================================
   API
===================================== */

app.use(
  apiRouter
);


/* =====================================
   404
===================================== */

app.use(
  notFoundHandler
);


/* =====================================
   ERROR HANDLER
===================================== */

app.use(
  errorHandler
);


export default app;