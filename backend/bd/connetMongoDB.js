import mongoose from "mongoose";


const connetMongoDB = async (params) => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI)
        console.log(`MongoDB connected:${conn.connection.host}`)
    } catch (error) {
        console.log(`Error connectiong to mongoDB:${error.message}`)
        process.exit(1)
    }
}

export default connetMongoDB