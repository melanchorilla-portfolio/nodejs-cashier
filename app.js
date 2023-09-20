import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connection from "./connection.js";
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
connection();

app.listen(env.APP_PORT, () => {
  console.log(`Server is running on http://localhost:${env.APP_PORT}`);
});
