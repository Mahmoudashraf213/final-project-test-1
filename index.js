// import modules
import path from "path"
import express from "express";
import dotenv from "dotenv"
import { connectDB } from "./db/connection.js";
import {bootStrap} from "./src/bootStrap.js";
// creat server
const app = express();
const port = 3000;
dotenv.config({path: path.resolve('./config/.env')})
// console.log(process.env.DB_URL);

// connect to db
connectDB();
// pares req
bootStrap(app,express)
// listen server
app.listen(port, () => {
  console.log("server listening on port", port);
});
