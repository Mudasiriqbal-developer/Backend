import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
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
    if(userId) {
        if(!isValidObjectId(userId)) {
            throw new ApiError(400, "Invalid userId")
        }
        filter.owner = new mongoose.Types.ObjectId(userId)
    }

    // Pagination and sorting
     const pageNumber = Math.max(1, parseInt(page, 10));
     const lim = Math.max(1, parseInt(limit, 10));
     const skip = (pageNumber - 1) * lim;
     const sortField = sortBy || "createdAt";
     const sort = {[sortField]: sortType === "asc" ? 1 : -1}

     const [videos, total] = await Promise.all([
        Video.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(lim)
        .populate("owner", "fullName userName email avatar")
        .lean(),
        Video.countDocuments(filter)
     ]);

     const meta = {
        total,
        page: pageNumber,
        limit: lim,
        totalPages: Math.ceil(total / lim),
     }

     return res.status(200).json(
         new ApiResponse(200, { videos, meta }, "Videos fetched successfully")
     );

});

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body
    if(!title?.trim() || !description?.trim()) {
        throw new ApiError(400, "Title and description are required")
    }

    const videoFileLocalPath = req.files?.videoFile?.[0]?.path
    const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path

    if(!videoFileLocalPath) {
        throw new ApiError(400, "Video file is required")
    }

    if(!thumbnailLocalPath) {
        throw new ApiError(400, "Thumbnail is required")
    }

    const [videoFile, thumbnail] = await Promise.all([
        uploadOnCloudinary(videoFileLocalPath, "video"),
        uploadOnCloudinary(thumbnailLocalPath, "image")
    ])

    if(!videoFile) {
        throw new ApiError(500, "Video upload failed")
    }

    if(!thumbnail) {
        throw new ApiError(500, "Thumbnail upload failed")
    }
    
    const video = await Video.create({
        videoFile: videoFile.url,
        thumbnail: thumbnail.url,
        title: title.trim(),
        description: description.trim(),
        duration: videoFile.duration || 0,
        owner: req.user?._id
    })

    return res.status(201)
    .json(
        new ApiResponse(201, video, "Video published successfully")
    )
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    if(!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid videoId")
    }

    const video = await Video.findById(videoId)
        .populate("owner", "fullName userName email avatar")
    if(!video) {
        throw new ApiError(404, "Video not found")
    }

    return res.status(200).json(
        new ApiResponse(200, video, "Video fetched successfully")
    )
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if(!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid videoId")
    }

    const video = await Video.findById(videoId)

    if(!video) {
        throw new ApiError(404, "Video not found")
    }

    if(video.owner?.toString() !== req.user?._id.toString()) {
        throw new ApiError(403, "You are not authorized to update this video")
    }

    const { title, description } = req.body

    if(title !== undefined) {
        if(title.trim() === "") {
            throw new ApiError(400, "Title cannot be empty")
        }
        video.title = title.trim()
    }

    if(description !== undefined) {
        if(description.trim() === "") {
            throw new ApiError(400, "Description cannot be empty")
        }
        video.description = description.trim()
    }

    const thumbnailLocalPath = req.file?.path

    if(thumbnailLocalPath) {
        const thumbnail = await uploadOnCloudinary(thumbnailLocalPath, "image")

        if(!thumbnail) {
            throw new ApiError(500, "Thumbnail upload failed")
        }
        video.thumbnail = thumbnail.url
    }

    await video.save()

    return res.status(200).json(
        new ApiResponse(200, video, "Video updated successfully")
    )
})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    if(!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid videoId")
    }

    const video = await Video.findById(videoId)

    if(!video) {
        throw new ApiError(404, "Video not found")
    }

    if(video.owner?.toString() !== req.user?._id.toString()) {
        throw new ApiError(403, "You are not authorized to delete this video")
    }

    await Video.findByIdAndDelete(videoId)

    return res.status(200).json(
        new ApiResponse(200, { deletedVideoId: videoId }, "Video deleted successfully")
    )
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if(!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid videoId")
    }

    const video = await Video.findById(videoId)

    if(!video) {
        throw new ApiError(404, "Video not found")
    }

    if(video.owner?.toString() !== req.user?._id?.toString()) {
        throw new ApiError(403, "You are not authorized to toggle publish status for this video")
    }

    video.isPubliched = !video.isPubliched
    await video.save()

    return res.status(200).json(
        new ApiResponse(200, video, "Publish status toggled successfully")
    )
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}