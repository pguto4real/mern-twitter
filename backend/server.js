import express from "express"
import dotenv from "dotenv"
import connetMongoDB from "./bd/connetMongoDB.js"

import authRoutes from './routes/auth.routes.js'

dotenv.config()

const app = express()

const PORT = process.env.PORT || 5000


app.use('/api/auth', authRoutes)

app.listen(8000, () => {
    console.log(`Server is running on port ${PORT}`);
    connetMongoDB()
})