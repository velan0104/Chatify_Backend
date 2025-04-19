import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import connnectDB from "./config/connect.js";
import authRoute from "./routes/Auth.route.js";
import contactRoute from "./routes/Contact.route.js";
import messageRoute from "./routes/Message.route.js";
import channelRoute from "./routes/Channel.route.js";
import setUpSocket from "./Sockets/socket.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;
const databaseURL = process.env.DATABASE_URL;

connnectDB(databaseURL);

app.use(
  cors({
    origin: [process.env.ORIGIN, "http://192.168.0.103:5173", "https://chat-application-six-peach.vercel.app"],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
  })
);

app.use("/uploads/profiles", express.static("uploads/profiles"));
app.use("/uploads/files", express.static("uploads/files"));
app.use("/uploads/channels", express.static("uploads/channels"));

app.use(cookieParser());
app.use(express.json());

app.use("/api/auth", authRoute);
app.use("/api/contact", contactRoute);
app.use("/api/message", messageRoute);
app.use("/api/channel", channelRoute);

const server = app.listen(port, () => {
  console.log(`Server is running at port ${port}`);
});

setUpSocket(server);

