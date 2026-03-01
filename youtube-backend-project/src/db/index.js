import mongoose from "mongoose";
import {DB_NAME} from "../constant.js";

const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGO_URI}/${DB_NAME}`,
      {
        serverSelectionTimeoutMS: 5000
      }
    );
    console.log(
      `\n MongoDB Connected !! DB Host:  ${connectionInstance.connection.host} \n`
    );

  } catch (error) {
    console.log("MongoDB Connection Error: ", error);
    process.exit(1);
  }
};

export default connectDB;
