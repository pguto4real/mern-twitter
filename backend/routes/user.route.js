import express from "express"
import { protectRoute } from "../middleware/protectRoute.js"
import { followUnfollowUser, getAllUsers, getFollowingPost, getLikedPostByCurrentUser, getSuggestedUsers, getUserProfile, updateUser } from "../controllers/user.controller.js"



const router = express.Router()


router.get('/profile/:username', protectRoute, getUserProfile)
router.get('/liked', protectRoute, getLikedPostByCurrentUser)
router.get('/following', protectRoute, getFollowingPost)
router.get('/suggested', protectRoute, getSuggestedUsers)
router.post('/follow/:id', protectRoute, followUnfollowUser)
router.post('/update', protectRoute, updateUser)
router.get('/', protectRoute, getAllUsers)

export default router
