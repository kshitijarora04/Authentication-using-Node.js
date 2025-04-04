// usemongo db atlas for getting a db on cloud
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

// export a function that connects a db

function connectDB() {
    mongoose.connect(process.env.MONGO_URL)
        .then(() => {
            console.log("Connected to Mongo DB");
        })
        .catch((error) => {
            console.log("Error connecting to Mongo DB");
        })
}

export default connectDB;