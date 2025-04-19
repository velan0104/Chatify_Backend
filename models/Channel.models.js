import mongoose from "mongoose";

const channelSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    members: [
        {
            type: mongoose.Schema.ObjectId,
            ref: "Users",
            required: true,
        }
    ],
    admin: {
        type: mongoose.Schema.ObjectId,
        ref: "Users",
        required: true,
    },
    image: {
        type: String,
        required: false,
        default: "https://www.svgrepo.com/show/152056/group.svg",
    },
    messages: [
        {
            type: mongoose.Schema.ObjectId,
            ref: "Messages",
        }
    ],
    createdAt: {
        type: Date,
        default: Date.now(),
    },
    updatedAt: {
        type: Date,
        default: Date.now(),
    },
});

channelSchema.pre("save", function (next) {
    this.updatedAt = Date.now();
    next();
});

channelSchema.pre("findOneAndUpdate", function (next) {
    this.set({ updatedAt: Date.now() });
    next();
})

const Channel = mongoose.model("Channels", channelSchema);
export default Channel;