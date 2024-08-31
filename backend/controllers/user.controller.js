import bcrypt from "bcryptjs";
import User from "../models/user.model.js";
import Notification from "../models/notification.model.js";
import Post from "../models/post.model.js";
import { v2 as cloudinary } from "cloudinary"

export const getUserProfile = async (req, res) => {
    const { username } = req.params
    try {
        const user = await User.findOne({ username }).select("-password");
        if (!user) {
            return res.status(404).json({ message: "User not found" })
        }
        return res.status(201).json(user)
    } catch (error) {
        console.log("Error in current user controller", error.message)
        return res.status(500).json({ error: "Internal Server Error in current user controller" })
    }
}
export const getSuggestedUsers = async (req, res) => {

    try {
        const currentUser = req.user._id
        console.log(currentUser)
        const userFollowedByMe = await User.findById(currentUser).select("following");
        const users = await User.aggregate([
            {
                $match: {
                    _id: { $ne: currentUser }
                }
            }, {
                $sample: { size: 10 }
            }
        ]).select("-password");;

        const filteredUsers = users.filter((user) => !userFollowedByMe.following.includes(user._id))
        const suggestedUsers = filteredUsers.slice(0, 4)

        suggestedUsers.forEach((user) => (user.password = null))
        return res.status(201).json(suggestedUsers)
    } catch (error) {
        console.log("Error in getSuggestedUsers controller", error.message)
        return res.status(500).json({ error: "Internal Server Error in getSuggestedUsers controller" })
    }
};
export const followUnfollowUser = async (req, res) => {


    try {
        const { id } = req.params
        const userToModify = await User.findById(id).select("-password");
        const currentUser = await User.findById(req.user._id).select("-password");

        if (!userToModify || !currentUser) {
            return res.status(404).json({ error: "User not found" })
        }
        if (id === req.user._id.toString()) {

            return res.status(404).json({ error: "You cant follow/unfollow yourself" })
        }

        const isFollowing = currentUser.following.includes(id)
        if (isFollowing) {
            //unfollow
            await User.findByIdAndUpdate(id, { $pull: { followers: req.user._id } })
            await User.findByIdAndUpdate(req.user._id, { $pull: { following: id } })
            return res.status(201).json({ message: "User unfollowed succesfully" })
        }
        else {
            //follow
            await User.findByIdAndUpdate(id, { $push: { followers: req.user._id } })
            await User.findByIdAndUpdate(req.user._id, { $push: { following: id } })
            //send notification to user
            const newNotification = new Notification({
                type: "follow",
                from: req.user._id,
                to: userToModify._id,
            });
            await newNotification.save()
            return res.status(201).json({ message: "User followed succesfully" })
        }

    } catch (error) {
        console.log("Error in followUnfollowUser controller", error.message)
        return res.status(500).json({ error: "Internal Server Error in current user controller" })
    }
};

export const updateUser = async (req, res) => {
    const { fullName, username, email, currentPassword, newPassword, bio, link } = req.body;
    let { profileImg, coverImg } = req.body;
    const currentUser = req.user._id
    try {
        const user = await User.findById(currentUser);
        if (!user) {
            return res.status(404).json({ error: "User not found" })
        }

        if ((!newPassword && currentPassword) || (newPassword && !currentPassword)) {
            return res.status(404).json({ error: "Please provide both current password and new password" })
        }

        if (newPassword && currentPassword) {

            const isMatch = await bcrypt.compare(currentPassword, user.password)

            if (!isMatch) return res.status(404).json({ error: "Current password is incorrect" })
            if (newPassword.length < 6) {
                return res.status(400).json({ error: "Password must be at least 6 character long" });
            }
            //hashed password
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(newPassword, 10);

        }

        if (profileImg) {
            if (user.profileImg) {
                await cloudinary.uploader.destroy(user.profileImg.split('/').pop().split('.')[0])
            }
            const uploadedResponse = await cloudinary.uploader.upload(profileImg)
            profileImg = uploaded.secure_url
        }
        if (coverImg) {
            if (user.coverImg) {
                await cloudinary.uploader.destroy(user.coverImg.split('/').pop().split('.')[0])
            }
            const uploadedResponse = await cloudinary.uploader.upload(coverImg)
            coverImg = uploaded.secure_url
        }
        user.fullName = fullName || user.fullName
        user.username = username || user.username
        user.email = email || user.email
        user.bio = bio || user.bio
        user.link = link || user.link
        user.profileImg = profileImg || user.profileImg
        user.coverImg = coverImg || user.coverImg
        await user.save();
        user.password = null
        return res.status(201).json(user)
    } catch (error) {
        console.log("Error in updateUser controller", error.message)
        return res.status(500).json({ error: "Internal Server Error in updateUser controller" })
    }
};
export const getLikedPost = async (req, res) => {

    const currentUser = req.user._id
    try {
        const user = await User.findById(currentUser)
        if (!user) {
            return res.status(404).json({ error: "User not found" })
        }
        const likedPosts = await Post.find({ _id: { $in: user.likedPosts } })
            .populate({ path: "user", select: "-password" })
            .populate({ path: "comments.user", select: "-password" })

        return res.status(201).json(likedPosts)
    } catch (error) {
        console.log("Error in getLikedPost controller", error.message)
        return res.status(500).json({ error: "Internal Server Error in getLikedPost controller" })
    }
};
export const getFollowingPost = async (req, res) => {

    const currentUser = req.user._id
    try {
        const user = await User.findById(currentUser)
        if (!user) {
            return res.status(404).json({ error: "User not found" })
        }
        const folowingPosts = await Post.find({user: { $in: user.following } })
        .sort({createdAt:-1})
            .populate({ path: "user", select: "-password" })
            .populate({ path: "comments.user", select: "-password" })

        return res.status(201).json(folowingPosts)
    } catch (error) {
        console.log("Error in getFollowingPost controller", error.message)
        return res.status(500).json({ error: "Internal Server Error in getFollowingPost controller" })
    }
};
export const getAllUsers = async (req, res) => {

    try {
        const post = await User.find().sort({ createdAt: -1 })
        .populate({
            path: "followers",
            select: "-password",
        })
        .populate({
            path: "following",
            select: "-password",
        })
        // .populate({
        //     path: "comments.user",
        //     select: "-password",
        // }).populate({
        //     path: "likes",
        //     select: "-password",
        // });

        if (post.length === 0) {
            return res.status(200).json({ message: "No Post found" })
        }
        return res.status(201).json(post)
    } catch (error) {
        console.log("Error in getAllUsers controller", error.message)
        return res.status(500).json({ error: "Internal Server Error in getAllUsers controller" })
    }
}