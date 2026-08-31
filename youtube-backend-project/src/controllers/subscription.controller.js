import mongoose, { isValidObjectId } from "mongoose";
import { User } from "../models/user.model.js";
import { Subscription } from "../models/subscription.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  if (!isValidObjectId(channelId)) {
    throw new ApiError(400, "Invalid channel Id");
  }

  const channel = await User.findById(channelId);
  if (!channel) {
    throw new ApiError(404, "Channel not found");
  }

  const subscriberId = req.user._id;

  const existingSubscription = await Subscription.findOne({
    subscriber: subscriberId,
    channel: channelId,
  });

  if (existingSubscription) {
    await Subscription.findByIdAndDelete(existingSubscription._id);
    return res.status(200).json(new ApiResponse(200, { isSubcribed: false }, "Unsubscribed successfully"));
  } else {
    const newSubscription = await Subscription.create({
      subscriber: subscriberId,
      channel: channelId,
    });
    return res
      .status(201)
      .json(
        new ApiResponse(201, { isSubcribed: true }, "Subscribed successfully")
      );
  }
});

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  if (!isValidObjectId(channelId)) {
    throw new ApiError(400, "Invalid channel Id");
  }

  const channel = await User.findById(channelId);
  if (!channel) {
    throw new ApiError(404, "Channel not found");
  }

  const subscribers = await Subscription.aggregate([
    {
      $match: {
        channel: new mongoose.Types.ObjectId(channelId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "subscriber",
        foreignField: "_id",
        as: "subscriberDetails",
      },
    },
    {
      $unwind: "$subscriberDetails"
    },
    {
      $project: {
        _id: "$subscriberDetails._id",
        userName: "$subscriberDetails.userName",
        fullName: "$subscriberDetails.fullName",
        avatar: "$subscriberDetails.avatar"
      }
    }
  ]);

  return res
    .status(200)
    .json(new ApiResponse(200, subscribers, "Subscribers fetched successfully"));
});

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { subscriberId } = req.params;

  if (!isValidObjectId(subscriberId)) {
    throw new ApiError(400, "Invalid subscriber ID");
  }

  const subscriber = await User.findById(subscriberId);
  if (!subscriber) {
    throw new ApiError(404, "Subscriber not found");
  }

  const subscriberChannels = await Subscription.aggregate([
    {
      $match: {
        subscriber: new mongoose.Types.ObjectId(subscriberId)
      }
    },
    {
      $lookup: {
        from: "users",
        localField: "channel",
        foreignField: "_id",
        as: "channelDetails"
      }
    },
    {
      $unwind: "$channelDetails"
    },
    {
      $project: {
        _id: "$channelDetails._id",
        userName: "$channelDetails.userName",
        email: "$channelDetails.email",
        avatar: "$channelDetails.avatar",
        coverImage: "$channelDetails.coverImage",
      }
    }
  ]);

  return res  
    .status(200)
    .json(
      new ApiResponse(200, subscriberChannels, "Subscribed channels fetched successfully")
    )
});

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };
