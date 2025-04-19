import mongoose from "mongoose";
import Channel from "../models/Channel.models.js";
import User from "../models/User.models.js";
import { renameSync, unlinkSync } from 'fs';

const createChannel = async (req, res, next) => {
    try {
        const { name, members } = req.body;
        const userId = req.userId;
        const admin = await User.findById(userId);
        if (!admin) {
            return res.status(400).send("Admin user not found");
        }

        const validMembers = await User.find({ _id: { $in: members } });

        if (validMembers.length !== members.length) {
            return res.status(400).send("Some members are not valid Users");
        }

        const newChannel = new Channel({
            name,
            members,
            admin: userId,
        })

        await newChannel.save();
        return res.status(201).json({ channel: newChannel });

    } catch (error) {
        return res.status(500).send("Internal server error")
    }
}

const getUserChannels = async (req, res, next) => {
    try {
        const userId = new mongoose.Types.ObjectId(req.userId)

        const channels = await Channel.find({
            $or: [{ admin: userId }, { members: userId }],
        }).sort({ updatedAt: -1 });

        return res.status(201).json({ channels });

    } catch (error) {
        return res.status(500).send("Internal server error")
    }
}

const getChannelMessages = async (req, res, next) => {
    try {
        const channelId = req.params.id;

        const channel = await Channel.findById(channelId).populate({
            path: 'messages',
            populate: {
                path: "sender",
                select: "firstName lastName email _id image color"
            }
        })

        if (!channel) {
            return Response.status(404).send("Channel not found.")
        }

        const messages = channel.messages;

        return res.status(201).json({ messages });

    } catch (error) {
        return res.status(500).send("Internal server error")
    }
}

const addMembers = async (req, res, next) => {
    try {
        const { channelId, memberId } = req.body;
        const userId = req.userId;

        const channel = await Channel.find({})

        const { members } = await Channel.findById(channelId, 'members');

        const isMemberExist = members.find((member) => member.toString() === memberId);

        if (channel.admin != userId) {
            return res.status(400).json("Only admin have the access to add members");
        }

        if (isMemberExist) {
            return res.status(400).json("Member already exist")
        }

        const ChannelDetails = await Channel.findByIdAndUpdate(
            channelId,
            {
                $push: { members: memberId },
            },
            {
                new: true
            }
        )

        return res.status(201).json({ ChannelDetails });

    } catch (error) {
        return res.status(500).send("Internal server error")
    }
}

const removeMember = async (req, res, next) => {
    try {

        const { channelId, memberId } = req.body;

        const { userId } = req;

        const channel = await Channel.findById(channelId);

        if (channel.admin.toString() != userId) {
            res.status(400).json("Only admin have access to remove members");
        }

        const updatedChannel = await Channel.findByIdAndUpdate(
            channelId,
            {
                $pull: { members: memberId }
            },
            { new: true }
        )

        res.status(200).json(updatedChannel)

    } catch (error) {
        return res.status(500).json("Internal server error");
    }
}

const leaveGroup = async (req, res, next) => {
    try {

        const { channelId } = req.body;

        const { userId } = req;

        const channel = await Channel.findById(channelId).populate('members');

        const length = channel.members.length;

        if (length <= 2) {
            return res.status(400).json("There is only 3 member in the group");
        }

        if (channel.admin.toString() === userId) {

            const randomMembers = Math.round(Math.random() * length);
            const newAdminId = channel.members[randomMembers]._id.toString();


            const removeMembers = await Channel.findByIdAndUpdate(
                channelId,
                {
                    $pull: { members: newAdminId }
                },
                { new: true }
            )

            const updateAdmin = await Channel.findByIdAndUpdate(
                channelId,
                {
                    $set: { admin: newAdminId },
                },
                { new: true }
            )

            res.status(200).json(updateAdmin)
        }

        const updatedChannel = await Channel.findByIdAndUpdate(
            channelId,
            {
                $pull: { members: userId }
            },
            { new: true }
        )

        res.status(200).json(updatedChannel)

    } catch (error) {
        return res.status(500).json("Internal server error");
    }
}

const deleteGroup = async (req, res, next) => {
    try {
        const { channelId } = req.body;
        const { userId } = req;

        const channel = await Channel.findById(channelId);

        if (channel.admin.toString() != userId) {
            return res.status(400).json("Only Admin have access to delete the group");
        }

        await Channel.findByIdAndDelete(channelId);
        return res.status(200).json("Group deleted successfully");

    } catch (error) {
        return res.status(400).json("Internal server error");
    }
}

const addProfileImage = async (req, res, next) => {
    try {
        const { channelId } = req.body;
        if (!req.file)
            return res.status(400).send("File is required.");

        const fileUrl = req.file.path;
        const publicId = req.file.filename;

        const updatedUser = await Channel.findByIdAndUpdate(channelId, { image: fileUrl }, { new: true, runValidators: true })

        return res.status(200).json({
            image: updatedUser.image,
        })
    } catch (error) {
        return res.status(500).send("Internal Server Error");
    }
}

const removeProfileImage = async (req, res, next) => {
    try {
        const { channelId } = req.body;
        const channel = await Channel.findById(channelId);

        if (!channel) {
            return res.status(404).send("Channel not found");
        }

        if (channel.image) {
            unlinkSync(channel.image)
        }

        channel.image = null;
        await channel.save();

        return res.status(200).send("Profile image removed successfully.")
    } catch (error) {
        return res.status(500).send("Internal Server Error");
    }
}

const getAllMembers = async (req, res, next) => {
    try {
        const channelId = req.params.id;

        const channels = await Channel.findById(channelId, {}).populate('members').populate('admin');

        const members = new Array();

        members.push(channels.admin);
        members.push(...channels.members);

        return res.status(201).json(members);

    } catch (error) {
        return res.status(500).send("Internal server error")
    }
}

const addNewMembers = async (req, res, next) => {
    try {
        const { channelId, memberId } = req.body;
        const { userId } = req;

        const channel = await Channel.findById(channelId);
        if (userId !== channel.admin.toString()) {
            return res.status(400).json("Only Admin can add new members");
        }

        const updatedChannel = await Channel.findByIdAndUpdate(
            channelId,
            {
                $push: { members: { $each: memberId } }
            },
            { new: true }
        )

        return res.status(200).json({ updatedChannel });
    } catch (error) {
        console.log(error)
    }
}

const getNewMembers = async (req, res, next) => {
    try {
        const { channelId } = req.body;
        const { userId } = req;

        const channel = await Channel.findById(channelId);

        if (channel.admin.toString() !== userId) {
            return res.status(400).json("Only admin have access to this route");
        }

        const existingMember = new Array();
        existingMember.push(channel.admin);
        existingMember.push(...channel.members);

        const newMembers = await User.find({ _id: { $nin: existingMember } });

        const members = newMembers.map((member) => ({
            label: member.firstName ? `${member.firstName} ${member.lastName}` : member.email,
            value: member._id
        }))

        return res.status(200).json(members);
    } catch (error) {
        res.status(400).json("Internal server error");
    }
}

const renameGroup = async (req, res, next) => {
    try {
        const { channelId, updatedName } = req.body;

        const updatedChannel = await Channel.findByIdAndUpdate(
            channelId,
            { name: updatedName },
            { new: true }
        )

        return res.status(201).json({ updatedChannel });
    } catch (error) {
        return res.status(400).json("Internal Server error");
    }
}

export { addMembers, addNewMembers, addProfileImage, createChannel, deleteGroup, getAllMembers, getChannelMessages, getNewMembers, getUserChannels, leaveGroup, removeMember, removeProfileImage, renameGroup };

