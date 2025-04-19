import express from "express";
import { verifyToken } from "../middlewares/Auth.middleware.js";
import { getMessages, uploadFile } from "../controllers/Message.controller.js";
import { upload } from "../config/multer.js";

const app = express.Router();

app.use(verifyToken);

app.post("/getMessage", getMessages);
app.post("/uploadFile", upload.single("file"), uploadFile);

export default app;
