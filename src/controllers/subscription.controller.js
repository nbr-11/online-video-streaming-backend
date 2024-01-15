import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    // TODO: toggle subscription

    if(!channelId){
        throw new ApiError(401,"ChannelId is required");
    }
    if(!mongoose.isValidObjectId(channelId)){
        throw new ApiError(401,"ChannelId is invalid");

    }

    const response = await Subscription.aggregate([
        {
            $match:{
                subscriber: new mongoose.Types.ObjectId(req.user._id),
                channel: new mongoose.Types.ObjectId(channelId)
            }
        }
    ]);

    if(!response[0]){

        await Subscription.create({
            subscriber:req.user._id,
            channel: channelId,
        });

       
    } else{

        await Subscription.findByIdAndDelete(response[0]._id);

    }


    return res 
           .status(200)
           .json(
                new ApiResponse(
                    200,
                    {},
                    "comment successfully toggeled"
                )
           );

})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params

    if(!channelId){
        throw new ApiError(401,"ChannelId is required");
    }
    if(!mongoose.isValidObjectId(channelId)){
        throw new ApiError(401,"ChannelId is invalid");

    }

    const subscribers = await Subscription.aggregate([
        {
            $match:{
                channel:channelId,
            }
        },
        {
            $lookup:{
                from:"users",
                localField:"subscriber",
                foreignField:"_id",
                as: "subscriber",
                pipeline:[
                    {
                        $project:{
                            fullName:1,
                            avatar:1,
                        }
                    }
                ]
            }
        },
        {
            $addFields:{
                subscriber:{
                    $first: "$subscriber",
                }
            }
        },
        {
            $project:{
                subscriber:1,
            }
        }
        
    ]);

    return res 
           .status(200)
           .json(
                new ApiResponse(
                    200,
                    subscribers,
                    "Fetched subscriber list of the user"

                )
           )
});

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params 

    if(!subscriberId){
        throw new ApiError(401,"ChannelId is required");
    }
    if(!mongoose.isValidObjectId(subscriberId)){
        throw new ApiError(401,"ChannelId is invalid");

    }

    const channels = await Subscription.aggregate([
        {
            $match:{
                subscriber:subscriberId,
            }
        },
        {
            $lookup:{
                form:"users",
                localField:"channel",
                foreignField: "_id",
                as:"channel",
                pipeline:[
                    {
                        $project:{
                            fullName:1,
                            avatar:1,
                        }
                    }
                ]
            }
        },
        {
            $addFields:{
                channel:{
                    $first: "$channel",
                }
            }
        },
        {
            $project:{
                channel:1,
            }
        }
    ]);

   return res 
          .status(200)
          .json(
                 new ApiResponse(
                    200,
                    channels,
                    "successfully fetched channels"
                 )
          );
});

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}

