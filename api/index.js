import app from "../server.js";
import connectedDb from "../src/db/db.js";

let dbConnection;

export default async function handler(req, res) {
  try {
    dbConnection ??= connectedDb();
    await dbConnection;
    return app(req, res);
  } catch (error) {
    console.error("Request initialization failed:", error);
    return res.status(500).json({ message: "Server initialization failed" });
  }
}
