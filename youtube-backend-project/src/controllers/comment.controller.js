import mongoose from "mongoose"
import {Comment} from "../models/comment.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query

    if(!mongoose.isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid videoId")
    }

    const pageNumber = Math.max(1, parseInt(page, 10));
    const lim = Math.max(1, parseInt(limit, 10));
    const skip = (pageNumber - 1) * lim;

    const filter = {videoId: videoId}

    const [comments, total] = await Promise.all([
        Comment.find(filter)
        .sort({createdAt: -1})
        .skip(skip)
        .limit(lim)
        .populate("userId", "name email")
        .lean(),
        Comment.countDocuments(filter)
    ])

    const meta = {
        total,
        page: pageNumber,
        limit: lim,
        totalPages: Math.ceil(total / lim),
    }

    return res.status(200)
    .json(
        new ApiResponse(200, { comments, meta }, "Comments fetched successfully")
    )

})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video

    const { videoId } = req.params
    const { content } = req.body

    if(!mongoose.isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid videoId")
    }

    if(!content || !content.trim()) {
        throw new ApiError(400, "Content is required")
    }

    const comment = await Comment.create({
        content: content.trim(),
        video: videoId,
        owner: req.user?._id
    })

    return res.status(201)
    .json(
        new ApiResponse(201, comment, "Comment added successfully")
    )
})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment

    if(!mongoose.isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid commentId")
    }

    const comment = await Comment.findById(commentId)

    if(!comment) {
        throw new ApiError(404, "Comment not found")
    }

    if(content !== undefined) {
        if(!content || !content.trim()) {
            throw new ApiError(400, "Comment Content can not be empty")
        }
    }

    await comment.save()

    return res.status(200)
    .json(
        new ApiResponse(200, comment, "Comment updated successfully")
    )
})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment

    if(!mongoose.isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid commentId")
    }

    const comment = await Comment.findById(commentId)

    if(!comment) {
        throw new ApiError(404, "Comment not found")
    }

    if(comment.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(403, "You are not authorized to delete this comment")
    }

    await Comment.findByIdAndDelete(commentId)

    return res.status(200)
    .json(
        new ApiResponse(200, null, { deleteCommentId: commentId }, "Comment deleted successfully")
    )
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
     deleteComment
    }