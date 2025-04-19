import express from "express";
import { addMembers, addNewMembers, addProfileImage, createChannel, deleteGroup, getAllMembers, getChannelMessages, getNewMembers, getUserChannels, leaveGroup, removeMember, removeProfileImage, renameGroup } from "../controllers/Channel.controller.js";
import { verifyToken } from "../middlewares/Auth.middleware.js";
import multer from "multer";

const app = express.Router();
const upload = multer({ dest: "uploads/channels/" })

app.use(verifyToken);

app.post("/createChannel", createChannel);
app.get("/getUserChannels", getUserChannels);
app.post("/addProfileImage", upload.single("group-profile-image"), addProfileImage);
app.delete("/removeProfileImage", removeProfileImage);
app.get("/getChannelMessages/:id", getChannelMessages);
app.post("/addMembers", addMembers);
app.delete("/removeMember", removeMember);
app.delete("/leaveGroup", leaveGroup);
app.delete("/deleteGroup", deleteGroup);
app.get("/getAllMembers/:id", getAllMembers);
app.post("/addNewMembers", addNewMembers);
app.post("/getNewMembers", getNewMembers);
app.put("/renameGroup", renameGroup);

export default app;