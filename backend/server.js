import express from "express"
import dotenv from "dotenv"
import connetMongoDB from "./db/connetMongoDB.js"

import authRoutes from './routes/auth.routes.js'
import cookieParser from "cookie-parser"

dotenv.config()

const app = express()

const PORT = process.env.PORT || 8000


//middle ware
app.use(express.json()) // for passing application json\\ to parse req.body
app.use(express.urlencoded({extended:true}))//parse data(url encoded)

app.use(cookieParser())
app.use('/api/auth', authRoutes)

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    connetMongoDB()
})