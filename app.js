import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";

import indexRouter from "./routes/index.js";

const env = dotenv.config().parsed;
var app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors({
  origin: 'http://localhost:3001'
}))

app.use("/", indexRouter);


// connect to mongodb
mongoose.set("strictQuery", false);
mongoose.connect(`${env.MONGODB_URI}${env.MONGODB_HOST}:${env.MONGODB_PORT}`, {
  dbName: env.MONGODB_DB_NAME,
});
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function () {
  console.log("Connected to MongoDB");
});

app.listen(env.APP_PORT, () => {
  console.log(`Server is running on http://localhost:${env.APP_PORT}`);
});
