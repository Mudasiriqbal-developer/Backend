import cloudinary from "cloudinary";
import fs from "fs";

// Strip surrounding quotes from env values if present
const stripQuotes = (v) => (typeof v === "string" ? v.replace(/^['"]|['"]$/g, "") : v);

const cloudName = stripQuotes(process.env.CLOUDINARY_CLOUD_NAME);
const apiKey = stripQuotes(process.env.CLOUDINARY_API_KEY);
const apiSecret = stripQuotes(process.env.CLOUDINARY_API_SECRET);

if (cloudName && apiKey && apiSecret) {
    cloudinary.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret,
    });
} else {
    cloudinary.config({
        cloud_name: cloudName || "",
        api_key: apiKey || "",
        api_secret: apiSecret || "",
    });
}

const isCloudinaryConfigured = () => Boolean(cloudName && apiKey && apiSecret);

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null;
        const response = await cloudinary.uploader.upload(localFilePath, { resource_type: "auto" });
       // console.log("file is uploaded on cloudinary", response.url);
       fs.unlinkSync(localFilePath)
        return response;
    } catch (error) {
        try {
            if (localFilePath && fs.existsSync(localFilePath)) fs.unlinkSync(localFilePath);
        } catch (_) {}
        return null;
    }
};

export { uploadOnCloudinary, isCloudinaryConfigured };