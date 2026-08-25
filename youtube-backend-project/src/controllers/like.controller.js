import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    //TODO: toggle like on video
    if(!mongoose.isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid videoId")
    }

    const video = await VideoColorSpace.findById(videoId)
    if(!video) {
        throw new ApiError(404, "Video not found")
    }

    const existingLike = await Like.findOne({
        video: videoId,
        likedBy: req.user._id,
    })

    if(existingLike) {
        await Like.findByIdAndDelete(existingLike._id)
        return res  
            .status(200)
            .json(
                new ApiResponse(200, { Liked: false }, "Video liked removed")
            )
    }

    await Like.create({
        video: videoId,
        likedBy: req.user._id
    })

    return res  
        .status(201)
        .json(
            new ApiResponse(201, { liked: true }, "Video liked successfully")
        )
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    //TODO: toggle like on comment
    if(!mongoose.isValidObjectId(commentId)) {
        throw new ApiError(400, "Ivalid CommentId")
    }

    const comment = await Comment.findById(commentId);
    if (!comment) {
        throw new ApiError(404, "Comment not found");
    }

    const existingLike = await Like.findOne({
        comment: commentId,
        likedBy: req.user._id
    })

    if(existingLike) {
        await Like.findByIdAndDelete(existingLike._id)
        return res
            .status(200)
            .json(new ApiResponse(200, { liked: false }, "comment liked removed"))
    }

    await Like.create({
        comment: commonId,
        likedBy: req.user._id,
    })

    return res
        .status(201)
        .json(new ApiResponse(201, { liked: true }, "Comment liked successfully"));
});

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    //TODO: toggle like on tweet

    if (!mongoose.isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweetId");
    }

    const tweet = await Tweet.findById(tweetId);
    if (!tweet) {
        throw new ApiError(404, "Tweet not found");
    }

    const existingLike = await Like.findOne({
        tweet: tweetId,
        likedBy: req.user._id,
    });

    if(existingLike) {
        await Like.findByIdAndDelete(existingLike._id)
        return res
        .status(200)
        .json(new ApiResponse(200, { liked: false }, "Tweet like removed"));
    }

    await Like.create({
        tweet: tweetId,
        likedBy: req.user._id
    })

    return res
    .status(201)
    .json(new ApiResponse(201, { Liked: true }, "Tweet Liked Successfully"))
}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos

    const likedVideos = await Like.find({
        likedBy: req.user._id,
        video: { $ne: null},
    })
        .populate({
            path: "video",
            populate: {
                path: "Owner",
                select: "fullName username avatar",
            },
        })
        .sort({ createdAt: -1})

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            likedVideos,
            "Liked videos fatched successfully"
        )
    )
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}