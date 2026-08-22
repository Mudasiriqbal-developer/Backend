import mongoose from "mongoose"
import {Video} from "../models/video.model.js"
import {Subscription} from "../models/subscription.model.js"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
    const [ videoStats, totalSubscribers ] = await Promise.all([
        Video.aggregate([
            { $match: { owner: channelId} },
            {
                $group: {
                    tatalVideo: { $sum: 1 },
                    totalViews: { $sum: "$views" },
                    videoIds: { $push: "$_id" },
                }
            },
        ]),
        Subscription.countDocuments({ channel: channel }),

    ]);

    const state = videoState[0] || {
        totalVideo: 0,
        totalViews: 0,
        videoIds: [],
    };

    const totalLikes = await Like.countDocuments({ 
        video: { $in: videoStats.videoIds } 
    });

    return res.status(200)
    .json(
        new ApiResponse(
            200,
            {
                totalVideo: stats.totalVideo,
                totalViews: stats.totalViews,
                totalLikes: totalLikes,
                totalSubscribers: totalSubscribers,
            },
            "Channel stats fetched successfully"
        )
    )
})

const getChannelVideos = asyncHandler(async (req, res) => {
    // TODO: Get all the videos uploaded by the channel

    const videos = await Video.find({ owner: req.users._id })
    .sort({ createdAt: -1 })
    .lean();

    return res.status(200)
    .json(
        new ApiResponse(
            200, 
            videos,
            "Channel videos fetched successfully"
        )
    )
})

export {
    getChannelStats, 
    getChannelVideos
    }