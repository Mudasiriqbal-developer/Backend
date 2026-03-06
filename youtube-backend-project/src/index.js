// require('dotenv').config({ path: ".env" })

import dotenv from "dotenv";
import connectDB from "./db/index.js";

dotenv.config({ 
    path: ".env" 
});

connectDB()

.then(() => {
  app.listen(process.env.PORT || 8000, () => {
    console.log(`Server is running on port: ${process.env.PORT || 8000}`);
  })
})
.catch((error) => {
  console.log("Error connecting to the database: ", error);
})



















/*
const app = express();

(async () => {
  try {
    await mongoose.connect(`${process.env.MONGO_URI}/${DB_Name}`);

    app.on("error", (error) => {
      console.log("ERROR: ", error);
      throw error;
    });

    app.listen(process.env.PORT, () => {
        console.log(`App is Listening on port ${process.env.PORT}`);
    });

  } catch (error) {
    console.error("ERROR: ", error);
    throw error;
  }
})();
*/