import bcrypt from "bcryptjs";
import User from "../models/user.model.js";
import Notification from "../models/notification.model.js";
import Post from "../models/post.model.js";
import { v2 as cloudinary } from "cloudinary"

export const getNotifications = async (req, res) => {
    const  id  = req.user._id
    try {
      
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ error: "User not found" })
        }
       

        const notifications = await Notification.find({ to:id })
        .populate({
            path:"from",
            select:"username profileImg"
        })
        if (!notifications) {
            return res.status(404).json({ message: "No Notification found for this user" })
        }
        await Notification.updateMany({to:id},{read:true})
        return res.status(201).json(notifications)
    } catch (error) {
        console.log("Error in getNotifications controller", error.message)
        return res.status(500).json({ error: "Internal Server Error in getNotifications controller" })
    }
}
export const deleteNotifications = async (req, res) => {

    try {
        const currentUser = req.user._id
        const notification =  await Notification.find({to:currentUser})
        console.log(notification)
        if (notification.length === 0) {
            return res.status(404).json({ error: "Notification not found" })
        }
         await Notification.deleteMany({to:currentUser})
        return res.status(201).json({message:"Notifications deleted succesfully"})
    } catch (error) {
        console.log("Error in deleteNotifications controller", error.message)
        return res.status(500).json({ error: "Internal Server Error in deleteNotifications controller" })
    }
};

export const deleteOneNotifications = async (req, res) => {

    try {
        const {id} = req.params
        const currentUser = req.user._id
        const notification =  await Notification.findById({_id:id})
        
        if (!notification) {
            return res.status(404).json({ error: "Notification not found" })
        }

        if (notification.to.toString() !== currentUser.toString()) {
            return res.status(404).json({ error: "You are not allowed to delete this notification" })
        }
        await Notification.findByIdAndDelete(id)
        return res.status(201).json({message:"Notifications deleted succesfully"})
    } catch (error) {
        console.log("Error in deleteNotifications controller", error.message)
        return res.status(500).json({ error: "Internal Server Error in deleteNotifications controller" })
    }
};
