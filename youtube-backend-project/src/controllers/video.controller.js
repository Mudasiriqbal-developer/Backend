import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination
    const filter = {}
    
    // Filter by query if provided
    if(query && query.trim() !== "") {
        const q = query.trim()
        filter.$or = [
            { title: { $regex: q, $options: "i" }},
            { description: { $regex: q, $options: "i" }}
        ];
    }

    // Filter by userId if provided
    if(userId && isValidObjectId(userId)) {
        if(!isValidObjectId(userId)) {
            throw new ApiError(400, "Invalid userId")
        }
    }

    // Pagination and sorting
     const pageNumber = Math.max(1, parseInt(page, 10));
     const lim = Math.max(1, parseInt(limit, 10));
     const skip = (pageNumber - 1) * lim;
     const sort = {[sortBy]: sortType === "asc" ? 1 : -1}

     const [videos, total] = await Promise.all([
        Video.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(lim)
        .populate("userId", "name email")
        .lean(),
        Video.countDocuments(filter)
     ]);

     const meta = {
        total,
        page: pageNumber,
        limit: lim,
        totalPages: Math.ceil(total / lim),
     }

     return res.status(200).json({
        success: true,
        data: {
            videos,
            meta
        }
     });

});

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body
    // TODO: get video, upload to cloudinary, create video
    
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail

})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}