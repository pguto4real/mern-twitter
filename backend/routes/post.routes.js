import express from "express"
import { protectRoute } from "../middleware/protectRoute.js"
import { commentOnPost, createPost, deletePost, getAllPost, getPostByUser, likeUnlikePost } from "../controllers/post.controller.js"


const router = express.Router()

// router.get('/update/:id',protectRoute, updatePost)
router.get('/',protectRoute, getAllPost)
router.get('/:id',protectRoute, getPostByUser)
router.post('/create',protectRoute, createPost)
router.delete('/:id',protectRoute, deletePost)
router.post('/comment/:id',protectRoute, commentOnPost)
router.post('/like/:id',protectRoute, likeUnlikePost)
// router.post('/login', login)
// router.post('/logout', logout)


export default router
