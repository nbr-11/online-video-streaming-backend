import express from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import  {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {User} from "../models/user.model.js"
import {Tweet} from "../models/tweet.model.js"
import mongoose from "mongoose";

const createTweet = asyncHandler( async( req, res) => {
    const {content} = req.body;

    const user = req?.user;

    console.log(content);
    console
    
    if(!content || !user){
        throw new ApiError(400, "content is required");
    }

    const tweet = await Tweet 
          .create(
            {
                content,
                owner:user._id
            },
          )

    return res 
           .status(200)
           .json(
                new ApiResponse(
                    200,
                    tweet,
                    "tweet created successfully",
                )
           )

    
});

const getUserTweets = asyncHandler(async (req, res) => {

    const {userId} = req.params;

    if(!userId){
        throw new ApiError(400, "Inavlid user Id");
    }

    

    const userTweets = await Tweet.aggregate([
        {
            $match:{
                owner: new mongoose.Types.ObjectId(userId)
            }
            
        },
        {
            $lookup:{
                from:"likes",
                localField:"_id",
                foreignField:"tweet",
                as:"likes"
            }
        },
        {
            $addFields:{
                isLiked:{
                    $cond: {
                        if: {$in : [userId, "$likes.likedBy"]},
                        then: true,
                        else: false,

                    }
                },
                likes: {
                    $size : "$likes"
                }
            }
        },
        {
            $project:{
                createdAt: 1,
                updatedAt:1,
                likes: 1,
                isLiked: 1,
                content: 1,
                _id:1
            }
        }
    ]);

    return  res 
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    userTweets,
                    "User tweets fetched successfully"
                )
            );

});

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet

    const {tweetId} = req.params;
    const  {content} = req.body;

    //validate the tweetid and content

    if(!tweetId || !content){
        throw new ApiError(401,"All fields are required");
    }

    // check if the logged in user is the owner

    const tweet = await Tweet.findById(tweetId);

    if(!tweet){
        throw new ApiError(401,"incorrect tweetid");
    }

    console.log(tweet.owner === req.user._id.content);
    console.log(req.user._id);

    if(!tweet.owner.equals(req.user._id)){
        throw new ApiError(403,"You are not auhtorized to update this todo");
    }

    //update the tweet

    const updatedTweet = await Tweet
                              .findByIdAndUpdate(
                                    tweetId,
                                    {
                                        $set:{
                                            content
                                        }
                                    },
                                    {
                                        new: true,
                                    }

                                );


    // return  the successfull resposne

    return res 
           .status(200)
           .json(
              new ApiResponse(
                    200,
                    updatedTweet,
                    "tweet updated Successfully"
              )
           );

})

const deleteTweet = asyncHandler(async (req, res) => {

    //extract the details
    const {tweetId} = req.params;

    //validate the details

    if(!tweetId){
        throw new ApiError(400,"tweetId");
    }

    //check the ownership 

    const tweet = await Tweet.findById(tweetId);

    if(!tweet.owner.equals(req.user._id)){     
        throw new ApiError(403,"You are unauthorized");
    }

    //delete the tweet

    const deletedTweet = await Tweet.findByIdAndDelete(tweetId);

    //send the response;

    return res 
           .status(200)
           .json(
                new ApiResponse(
                    200,
                    deletedTweet,
                    "Todo deleted successfully"
                )
           );

});



export {
    createTweet,
    updateTweet,
    deleteTweet,
    getUserTweets,
}

