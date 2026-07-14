import mongoose from "mongoose";
import { DB_NAME } from "../constant.js";

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || `mongodb://localhost:27017/${DB_NAME}`;
    const connectionInstance = await mongoose.connect(mongoUri);

    console.log(
      `\n MongoDB Connected !! DB Host: ${connectionInstance.connection.host} \n`
    );
  } catch (error) {
    console.log("MongoDB Connection Error: ", error);
    process.exit(1);
  }
};

export default connectDB;
