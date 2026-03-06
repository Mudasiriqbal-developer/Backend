import cookieParser from "cookie-parser";
import express from "express";
import cors from "cors";


const app = express();

app.on("error", (error) => {
    console.log("ERROR: ", error);
    throw error;
});


export { app };