// to use import keyword-->module
// mongoose is used to connect to the DB(ODM)-->Object data modelling Library
// Enviroment varaibles do not connect to db automatically, you need to restart the server

// Boilerplate code for any express project
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./utils/db.js";
import cookieParser from "cookie-parser";

// import all routes
import userRoutes from "../Building Full Stack Project/routes/user.routes.js";

// cors is used so that my frontend can only send a request to my backend
dotenv.config();

const app = express();

//app.use() is a middleware
app.use(cookieParser());

// we can write configurations inside cors
app.use(
  cors({
    // origin should match the frontend url
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept"],
    exposedHeaders: ["Set-Cookie", "*"],
  })
);

// to send json from frontend to backend
app.use(express.json());

// to support url-encoding such as %20 = space
app.use(express.urlencoded({ extended: true }));

const port = process.env.PORT || 4000;

// this syntax is given by express
// this will run on request
// Routes always start with /

app.get("/", (req, res) => {
  res.send("cohort!!");
});

app.get("/kshitij", (req, res) => {
  res.send("kshitij!!");
});

// callbacks are also known as controllers
app.get("/hitesh", (req, res) => {
  res.send("Hitesh");
});

// connecting to DB
connectDB();

// user routes
app.use("/api/v1/users", userRoutes);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
