import express from "express";
import { addProfileImage, getUserInfo, login, logout, removeProfileImage, signup, updateProfile } from "../controllers/Auth.controller.js";
import { verifyToken } from "../middlewares/Auth.middleware.js";
import multer from "multer";

const app = express.Router();
const upload = multer({ dest: "uploads/profiles/" })

app.post("/signup", signup);
app.post("/login", login);

app.use(verifyToken);
app.get("/userInfo", getUserInfo)
app.post("/updateProfile", updateProfile);
app.post("/addProfileImage", upload.single("profile-image"), addProfileImage);
app.delete("/removeProfileImage", removeProfileImage)
app.post('/logout', logout)

export default app;