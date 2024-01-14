import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {User} from "../models/user.model.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    //TODO: toggle like on video
    if(!videoId){
        throw new ApiError(401,"videoId is required");
    }

    if(!isValidObjectId(videoId)){
        throw new ApiError(401, "videoId is not valid");
    }

    //check if the videoId is present in the like collection

    const likeOnVideo = await Like
                              .findOne(
                                {
                                    likedBy:req.user._id, 
                                    video:videoId
                                }
                               );

    //if yes the delete that document 
    //if no then create a new like document

    if(likeOnVideo){
        await Like.findByIdAndDelete(likeOnVideo._id);

    } else{
       await Like.create({
          video:videoId,
          likedBy:req.user._id
       })
    }

   return res 
          .status(200)
          .json(
            new ApiResponse(
                200,
                {},
                "like toggled successfully on the video",
            )
          );
    
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    //TODO: toggle like on comment
    
    if(!commentId){
        throw new ApiError(401,"commentId is required");
    }

    if(!isValidObjectId(commentId)){
        throw new ApiError(401, "commentId is not valid");
    }

    //check if the commentId is present in the like collection

    const likeOnVideo = await Like
                              .findOne(
                                {
                                    likedBy:req.user._id, 
                                    comment:commentId
                                }
                               );

    //if yes the delete that document 
    //if no then create a new like document

    if(likeOnVideo){
        await Like.findByIdAndDelete(likeOnVideo._id);

    } else{
       await Like.create({
          comment:commentId,
          likedBy:req.user._id
       })
    }

   return res 
          .status(200)
          .json(
            new ApiResponse(
                200,
                {},
                "like toggled successfully on the comment",
            )
          );

})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    //TODO: toggle like on tweet

    if(!tweetId){
        throw new ApiError(401,"tweetId is required");
    }

    if(!isValidObjectId(tweetId)){
        throw new ApiError(401, "tweetId is not valid");
    }

    //check if the tweetId is present in the like collection

    const likeOnVideo = await Like
                              .findOne(
                                {
                                    likedBy:req.user._id, 
                                    tweet:tweetId
                                }
                               );

    //if yes the delete that document 
    //if no then create a new like document

    if(likeOnVideo){
        await Like.findByIdAndDelete(likeOnVideo._id);

    } else{
       await Like.create({
          tweet:tweetId,
          likedBy:req.user._id
       })
    }

   return res 
          .status(200)
          .json(
            new ApiResponse(
                200,
                {},
                "like toggled successfully on the tweet",
            )
          );

}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos

    const userLikedVideo = await Like.aggregate([
        {
            $match:{
                likedBy: req?.user._id,
                video:{
                    $exists: true,
                }
            }
        }
    ]);


    return res 
           .status(200)
           .json(
                new ApiResponse(
                    200,
                    userLikedVideo,
                    "Liked video fetched of the logged in user"
                )
           )
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
};

