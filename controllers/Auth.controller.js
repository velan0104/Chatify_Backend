import User from "../models/User.models.js";
import jwt from "jsonwebtoken";
import bcrypt from 'bcrypt';
import { renameSync, unlinkSync } from 'fs';

const maxAge = 3 * 24 * 60 * 60 * 1000;

const createToken = (email, userId) => {
    return jwt.sign({ email, userId }, process.env.JWT_KEY, { expiresIn: maxAge })
}

const cookieOptions = {
    maxAge,
    secure: true,
    sameSite: "None",
}

const signup = async (req, res, next) => {

    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).send("Email and Password is required");
        }

        const user = await User.create({ email, password });

        return res.status(201).cookie("chat-token", createToken(email, user._id), cookieOptions).json({
            user
        })

    } catch (error) {
        return res.status(500).send("Internal Server Error");
    }
}

const login = async (req, res, next) => {

    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).send("Email and Password is required");
        }

        const user = await User.findOne({ email });

        if (!user)
            return res.status(404).send("User with the given email not found.");

        const auth = await bcrypt.compare(password, user.password);

        if (!auth)
            return res.status(404).send("Password is incorrect");


        return res.status(201).cookie("chat-token", createToken(email, user._id), cookieOptions).json({
            user: {
                id: user._id,
                email: user.email,
                profileSetup: user.profileSetup,
                firstName: user.firstName,
                lastName: user.lastName,
                image: user.image,
                color: user.color,
            }
        })

    } catch (error) {
        return res.status(500).send("Internal Server Error");
    }
}

const getUserInfo = async (req, res, next) => {
    try {
        const userData = await User.findById(req.userId);
        if (!userData)
            return res.status(404).send("User with the given id not found.");

        return res.status(200).json({
            id: userData._id,
            email: userData.email,
            profileSetup: userData.profileSetup,
            firstName: userData.firstName,
            lastName: userData.lastName,
            image: userData.image,
            color: userData.color,
        })
    } catch (error) {
        return res.status(500).send("Internal Server Error");
    }
}

const updateProfile = async (req, res, next) => {
    try {
        const { userId } = req;
        const { firstName, lastName, color } = req.body;
        if (!firstName || !lastName) {
            return res.status(400).send("Firstname lastname color is required.")
        }
        const userData = await User.findByIdAndUpdate(
            userId,
            {
                firstName,
                lastName,
                color,
                profileSetup: true
            },
            { new: true, runValidators: true }
        )

        return res.status(200).json({
            id: userData._id,
            email: userData.email,
            profileSetup: userData.profileSetup,
            firstName: userData.firstName,
            lastName: userData.lastName,
            image: userData.image,
            color: userData.color,
        })
    } catch (error) {
        return res.status(500).send("Internal Server Error");
    }
}

const addProfileImage = async (req, res, next) => {
    try {
        if (!req.file)
            return res.status(400).send("File is required.");

        const fileUrl = req.file.path;
        const publicId = req.file.filename;

        const updateUser = await User.findByIdAndUpdate(req.userId, { image: fileUrl }, { new: true, runValidators: true })

        return res.status(200).json({
            image: updateUser.image,
        })
    } catch (error) {
        return res.status(500).send("Internal Server Error");
    }
}

const removeProfileImage = async (req, res, next) => {
    try {
        const { userId } = req;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).send("User not found");
        }

        if (user.image) {
            unlinkSync(user.image)
        }

        user.image = null;
        await user.save();

        return res.status(200).send("Profile image removed successfully.")
    } catch (error) {
        return res.status(500).send("Internal Server Error");
    }
}

const logout = async (req, res, next) => {
    try {
        res.cookie('chat-token', '', { maxAge: 1, secure: true, sameSite: "None" })
        return res.status(200).json("Logout successfully")
    } catch (error) {
        return res.status(500).json("Internal server error")
    }
}


export { signup, login, getUserInfo, updateProfile, addProfileImage, removeProfileImage, logout }