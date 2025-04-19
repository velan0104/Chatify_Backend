import express from "express";
import { verifyToken } from "../middlewares/Auth.middleware.js";
import { getAllContacts, getContactForDMList, searchContact } from "../controllers/Contact.controller.js";

const app = express.Router();

app.use(verifyToken);

app.post('/search', searchContact);
app.get('/getContacts', getContactForDMList);
app.get('/getAllContacts', getAllContacts);

export default app;
