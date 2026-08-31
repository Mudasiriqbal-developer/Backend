import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    const { content } = req.body

    if(!content || !content.trim()) {
        throw new ApiError(400, "Tweet Content is Reauired")
    }

    const tweet = await Tweet.create({
        content: content.trim(),
        owner: req.user._id
    })

    return res.status(201).json(
        new ApiResponse(201, tweet, "Tweet Created Successfully")
    )
})

const getUserTweets = asyncHandler(async (req, res) => {
    const { userId } = req.params

    if(!isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid userId")
    }

    const user = await User.findById(userId).select("_id").lean()

    if(!user) {
        throw new ApiError(404, "User not found")
    }

    const tweets = await Tweet.find({ owner: userId })
    .sort({ createdAt: -1})
    .populate("owner", "userName fullName avatar")
    .lean()

    return res.status(200).json(
        new ApiResponse(200, tweets, "User tweets fetched successfully")
    )
})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet

    const { tweetId } = req.params
    const { content } = req.body
    
    if(!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid Tweet")
    }

    if (!content || !content.trim()) {
        throw new ApiError(400, "Tweet content cannot be empty")
    }

    const tweet = await Tweet.findById(tweetId)

    if (!tweet) {
        throw new ApiError(404, "Tweet not found")
    }

    if (tweet.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to update this tweet")
    }

    tweet.content = content.trim()
    await tweet.save()

    return  res.status(200).json(
        new ApiResponse(200, tweet, "Tweet update successfully")
    )
})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet

    const { tweetId } = req.params

    if((!isValidObjectId(tweetId))) {
        throw new ApiError(400, "Invalid tweetId")
    }

     const tweet = await Tweet.findById(tweetId)

    if (!tweet) {
        throw new ApiError(404, "Tweet not found")
    }

    if (tweet.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to delete this tweet")
    }

    await Tweet.findByIdAndDelete(tweetId)

    return res.status(200).json(
        new ApiResponse(
            200,
            { deletedTweetId: tweetId },
            "Tweet deleted successfully"
        )
    )
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}