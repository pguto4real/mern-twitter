import express from "express"
import { protectRoute } from "../middleware/protectRoute.js"
import { commentOnPost, createPost, deletePost, getAllPost, getLikedPost, getPostByUser, likeUnlikePost } from "../controllers/post.controller.js"


const router = express.Router()


router.get('/',protectRoute, getAllPost)
router.get('/like/:id',protectRoute, getLikedPost)
router.get('/:username',protectRoute, getPostByUser)
router.post('/create',protectRoute, createPost)
router.delete('/:id',protectRoute, deletePost)
router.post('/comment/:id',protectRoute, commentOnPost)
router.post('/like/:id',protectRoute, likeUnlikePost)



export default router
