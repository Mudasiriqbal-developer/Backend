import mongoose from "mongoose";
import {DB_NAME} from "../constant.js";

const connectDB = async () => {
  try {
    console.log(process.env.MONGO_URI)
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGO_URI}/youtube`,
    );
    console.log("connection", connectionInstance);
    console.log(
      `\n MongoDB Connected !! DB Host:  ${connectionInstance.connection.host} \n`
    );

  } catch (error) {
    console.log("MongoDB Connection Error: ", error);
    process.exit(1);
  }
};

export default connectDB;
