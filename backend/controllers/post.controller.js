import bcrypt from "bcryptjs";
import User from "../models/user.model.js";
import Post from "../models/post.model.js";
import Notification from "../models/notification.model.js";
import { v2 as cloudinary } from "cloudinary"

export const createPost = async (req, res) => {

    try {
        const currentUser = req.user._id.toString()
        console.log(currentUser)
        const { text } = req.body;
        let { img } = req.body;
        const user = await User.findById(currentUser);
        if (!user) {
            return res.status(404).json({ error: "User not found" })
        }

        if (!text && !img) {
            return res.status(404).json({ error: "Post cannot be empty.it must have a text or image" })
        }
        if (img) {
            const uploadedResponse = await cloudinary.uploader.upload(img)
            img = uploadedResponse.secure_url
        }
        // return
        const newPost = new Post({
            user: currentUser,
            text,
            img: img
        });

        await newPost.save();
        return res.status(201).json(newPost)
    } catch (error) {
        console.log("Error in createPost controller", error.message)
        return res.status(500).json({ error: "Internal Server Error in createPost controller" })
    }
};
export const deletePost = async (req, res) => {
    try {
        const { id } = req.params
        const post = await Post.findById(id);
        if (!post) {
            return res.status(404).json({ error: "Post not found" })
        }
        if (req.user._id.toString() !== post.user._id.toString()) {

            return res.status(404).json({ error: "You are not authorized to delete this post" })
        }
        if (post.img) {

            await cloudinary.uploader.destroy(post.img.split('/').pop().split('.')[0])

        }

        await Post.findByIdAndDelete(id)
        return res.status(201).json({ message: "Post deleted succesfully" })
    } catch (error) {
        console.log("Error in deletePost controller", error.message)
        return res.status(500).json({ error: "Internal Server Error in deletePost controller" })
    }

};
export const commentOnPost = async (req, res) => {


    try {
        const { id } = req.params
        const { text } = req.body;
        const currentUser = req.user._id.toString()
        const post = await Post.findById(id);
        if (!post) {
            return res.status(404).json({ error: "Post not found" })
        }
        if (!text) {
            return res.status(404).json({ error: "Comment cannot be empty." })
        }
        const comment = { text, user: currentUser }
        //follow
        post.comments.push(comment)
        await post.save()
        //send notification to user
        const newNotification = new Notification({
            type: "commented",
            from: req.user._id,
            to: post.user,
        });
        await newNotification.save()
        return res.status(201).json({ message: "posted a comment succesfully", data: post })


    } catch (error) {
        console.log("Error in commentOnPost controller", error.message)
        return res.status(500).json({ error: "Internal Server Error in commentOnPost controller" })
    }
};


export const likeUnlikePost = async (req, res) => {


    try {
        const { id } = req.params
        const postToModify = await Post.findById(id)
        const userId = req.user._id

        if (!postToModify) {
            return res.status(404).json({ error: "Post not found" })
        }

        const isLiked = postToModify.likes.includes(userId)
        if (isLiked) {
            //unfollow
            await User.findByIdAndUpdate(userId, { $pull: { likedPosts: id } })
            await Post.findByIdAndUpdate(id, { $pull: { likes: userId } })

            return res.status(201).json({ message: "Post unliked succesfully" })
        }
        else {
            //follow
            // const newPost = await Post.findByIdAndUpdate(id, { $push: { likes: userId } })
            await User.findByIdAndUpdate(userId, { $push: { likedPosts: id } })
            postToModify.likes.push(userId)
            await postToModify.save()
            //send notification to user
            const newNotification = new Notification({
                type: "like",
                from: userId,
                to: postToModify.user,
            });
            await newNotification.save()
            return res.status(201).json({ message: "Post Liked succesfully", data: postToModify })
        }

    } catch (error) {
        console.log("Error in followUnfollowUser controller", error.message)
        return res.status(500).json({ error: "Internal Server Error in current user controller" })
    }
};

export const getAllPost = async (req, res) => {

    try {
        const post = await Post.find().sort({ createdAt: -1 }).populate({
            path: "user",
            select: "-password",
        }).populate({
            path: "comments.user",
            select: "-password",
        }).populate({
            path: "likes",
            select: "-password",
        });

        if (post.length === 0) {
            return res.status(200).json({ message: "No Post found" })
        }
        return res.status(201).json(post)
    } catch (error) {
        console.log("Error in current user controller", error.message)
        return res.status(500).json({ error: "Internal Server Error in current user controller" })
    }
}
export const getPostByUser = async (req, res) => {

    try {
        const { id } = req.params

        const user = await User.findById(id)
        if (!user) {
            return res.status(404).json({ error: "User not found" })
        }
        const postByUserId = await Post.find({ user: id })
            .sort({ createdAt: -1 })
            .populate({ path: "user", select: "-password" })
            .populate({ path: "comments.user", select: "-password" });
        if (!postByUserId) {
            return res.status(404).json({ message: "No Post found" })
        }

        return res.status(201).json(postByUserId)
    } catch (error) {
        console.log("Error in getPostByUser controller", error.message)
        return res.status(500).json({ error: "Internal Server Error in getPostByUser controller" })
    }
};

export const updatePost = async (req, res) => {
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