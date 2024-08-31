import bcrypt from "bcryptjs";
import User from "../models/user.model.js";
import { generateTokenAndSetCookie } from "../lib/utils/generateToken.js";

export const signup = async (req, res) => {
  
    try {
  
        const { fullName, username, email, password } = req.body;

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: "Invalid email format" });
        }

        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ error: "Username is already taken" });
        }

        const existingEmail = await User.findOne({ email });
        if (existingEmail) {
            return res.status(400).json({ error: "Email is already taken" });
        }
        if (password.length < 6) {
            return res.status(400).json({ error: "Password must be at least 6 character long" });
        }
        //hashed password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            fullName,
            username,
            email,
            password: hashedPassword,
        });
        if (newUser) {
            generateTokenAndSetCookie(newUser._id, res)
            await newUser.save();
            return res.status(201).json({
                _id: newUser._id,
                fullName: newUser.fullName,
                username: newUser._id,
                followers: newUser.followers,
                following: newUser.following,
                profileImg: newUser.profileImg,
                coverImg: newUser.coverImg,
                bio: newUser.bio,
                link: newUser.link,
                _id: newUser._id,
            })
        }
        else {

            return res.status(400).json({ error: "Invalid User data" })
        }
    } catch (error) {
        console.log("Error in signup controller", error.message)
        return res.status(500).json({ error: "Internal Server Error" })
    }
};
export const login = async (req, res) => {
  
    try {
        const { username, password } = req.body;
        const existingUser = await User.findOne({ username });
        const isCorrectpassword = await bcrypt.compare(password, existingUser?.password || "")

        if (!isCorrectpassword || !existingUser) {
            return res.status(500).json({ error: "Invalid Username or password" })
        }
        generateTokenAndSetCookie(existingUser._id, res)
        return res.status(201).json({
            _id: existingUser._id,
            fullName: existingUser.fullName,
            username: existingUser._id,
            followers: existingUser.followers,
            following: existingUser.following,
            profileImg: existingUser.profileImg,
            coverImg: existingUser.coverImg,
            bio: existingUser.bio,
            link: existingUser.link,
            _id: existingUser._id,
        })
    } catch (error) {
        console.log("Error in login controller", error.message)
        return res.status(500).json({ error: "Internal Server Error in login controller" })
    }
};
export const logout = async (req, res) => {

    try {
        res.cookie('jwt', '', { maxAge: 0 })
        return res.status(201).json({ message: "Logged out succesfully" })
    } catch (error) {
        console.log("Error in logout controller", error.message)
        return res.status(500).json({ error: "Internal Server Error in logout controller" })
    }
};

export const currentUser = async (req, res) => {

    try {
        const user = await User.findById(req.user._id).select("-password").populate({
            path: "likedPosts",
        });
        return res.status(201).json(user)
    } catch (error) {
        console.log("Error in current user controller", error.message)
        return res.status(500).json({ error: "Internal Server Error in current user controller" })
    }
};