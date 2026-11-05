import { config } from "dotenv";
import morgan from "morgan";
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import helmet from "helmet";
import compression from "compression";
import rateLimit from "express-rate-limit";
import connectedDb from "./src/db/db.js";
import router from "./src/routes/user-routes/user-routes.js";

config();

const server = express();
const limit = rateLimit({
  windowMs: 1000 * 60 * 15,
  max: 50,
  standardHeaders: true,
});

server.use(morgan("dev"));
server.use(express.json());
server.use(cors());
server.use(helmet());
server.use(compression());
server.use(limit);
server.use(router);
server.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

server.get("/", (_req, res) => {
  res.status(200).send({ message: "Your First Api in Node Js" });
});

export default server;

// Keep `npm start` usable for local development; Vercel imports the app above.
const currentFile = fileURLToPath(import.meta.url);
if (process.argv[1] && path.resolve(process.argv[1]) === currentFile) {
  const port = process.env.PORT || 5050;
  connectedDb().then(() => {
    server.listen(port, () => console.log(`Node server listening on ${port}`));
  });
}
