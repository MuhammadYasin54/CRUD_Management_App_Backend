
import {config} from "dotenv"
import morgan from "morgan";
import express from "express";
import cors from "cors"
import dns from "dns";
import connectedDb from "./src/db/db.js";
import router from "./src/routes/user-routes/user-routes.js";
import path from "path";
import helmet from "helmet";
import compression from "compression";
import rateLimit from "express-rate-limit"

dns.setDefaultResultOrder("ipv4first"); // For resolving hostnames to IPv4 addresses first...!
dns.setServers(["1.1.1.1", "8.8.8.8"]); // For setting custom DNS servers...!
const port = 5050;
const server = express();
const limit = rateLimit({
    windowMs : 1000 * 60 * 15,
    max : 50,
    standardHeaders : true
})

config({path: "./.env"})


server.use(morgan("dev"));
server.use(express.json())
server.use(cors());
server.use(helmet());
server.use(compression());
server.use(limit);
server.use(router)

server.use('/uploads', express.static(path.join(process.cwd(), 'uploads')))
console.log("DB_URL:", process.env.DB_URL);
// " First API is Calling...!"

server.get("/",(req, res)=>{
    return res.status(200).send({
        message: "Your First Api in Node Js"
    })
})


server.listen(process.env.PORT || 5050, ()=>{
    console.log("Welcome, your Node Js Server is Running..!")
    connectedDb();
})
