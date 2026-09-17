import app from "./app.js";
import { env } from "./config/env.js";

const server = app.listen(env.PORT, () => {
  console.log(`OPTICANA API running on http://localhost:${env.PORT}`);
});

function shutdown(signal) {
  console.log(`\nReceived ${signal}. Shutting down...`);

  server.close((error) => {
    if (error) {
      console.error("Shutdown error:", error);
      process.exit(1);
    }

    process.exit(0);
  });
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
