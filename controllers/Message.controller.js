import Message from "../models/Message.models.js";
import { mkdirSync, renameSync } from "fs";

const getMessages = async (req, res, next) => {
  try {
    const user1 = req.userId;
    const user2 = req.body.id;

    if (!user1 || !user2)
      return res.status(400).send("Both user ID's are required.");

    const messages = await Message.find({
      $or: [
        { sender: user1, recipient: user2 },
        { sender: user2, recipient: user1 },
      ],
    }).sort({ timestamp: 1 });

    return res.status(200).json({ messages });
  } catch (error) {
    return res.status(500).send("Internal server error");
  }
};

const uploadFile = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).send("File is required");
    }

    const fileUrl = req.file.path;
    const publicId = req.file.filename;

    return res.status(200).json({ fileUrl, publicId });
  } catch (error) {
    return res.status(500).send("Internal server error");
  }
};

export { getMessages, uploadFile };
