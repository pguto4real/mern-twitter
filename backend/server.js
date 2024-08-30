import express from "express"
import dotenv from "dotenv"
import connetMongoDB from "./db/connetMongoDB.js"

import authRoutes from './routes/auth.routes.js'
import userRoutes from './routes/user.routes.js'

import cookieParser from "cookie-parser"
import { v2 as cloudinary } from "cloudinary"

dotenv.config()
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_SECRET,
})

const app = express()

const PORT = process.env.PORT || 8000


//middle ware
app.use(express.json()) // for passing application json\\ to parse req.body
app.use(express.urlencoded({ extended: true }))//parse data(url encoded)

app.use(cookieParser())

app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    connetMongoDB()
})