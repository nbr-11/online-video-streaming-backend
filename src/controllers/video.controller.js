import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {deleteFromCLoudinary, uploadOnCloudinary} from "../utils/cloudinary.js"
import { Comment } from "../models/comment.model.js"
import { Like } from "../models/like.model.js"



const getAllVideosOfUser = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query="", sortBy="createdAt", sortType=1, userId } = req.query
   
    if(!userId){
        throw new ApiError(400,"user is required");
    }

    const aggregator = Video.aggregate([
        {
           $match:{
                owner: new mongoose.Types.ObjectId("65a2693f938a7fd010d0ee92"),  
                title: {
                    $regex: query,
                    $options: "i"
                }
           },
           
        },
        {
            $sort:{
                [sortBy]:Number(sortType),
           } 
        }
        
    ]);

    const options = {
        page,
        limit
    }

    const response = await Video.aggregatePaginate(aggregator,options);

   
    return res 
           .status(200)
           .json(
             new ApiResponse(
                200,
                response,
                "The "
             )
           )
    
});

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body
    // TODO: get video, upload to cloudinary, create video


    //get the details from req.body
    const videoLocalFilePath = req.files?.video?.[0]?.path;
    const  thumbnailLocalFilePath = req.files?.thumbnail?.[0]?.path;

    //validate them

    if(!videoLocalFilePath){
        throw new ApiError(401,"video is required");
    }

    if(!thumbnailLocalFilePath){
        throw new ApiError(401,"thumbnail is required");
    }

    if(!title || !description){
        throw new ApiError(401, "all fields are required");
    }

    //upload the video and thumbnail on cloudinary 

    const video  = await uploadOnCloudinary(videoLocalFilePath);
    const thumbnail = await uploadOnCloudinary(thumbnailLocalFilePath);
    
    if(!video){
        throw new ApiError(500, "Something went wrong while uploading the video file");
    }

    if(!thumbnail){
        throw new ApiError(500,"Somehting went wrong while uploading the thumbnail");
    }

    console.log(video);

    //create a database entry 

    const videoCreated = await Video.create({
        videoFile: video.url,
        thumbnail: thumbnail.url,
        title,
        description,
        duration: video?.duration,
        owner:req.user._id,
    })

    //return the resposne
    return res 
           .status(200)
           .json(
            new ApiResponse(
                200,
                videoCreated,
                "Video uploaded successfully"
            )
           );

})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id

    if(!videoId){
        throw new ApiError(400,"Video Id is required");
    }

    if(!mongoose.isValidObjectId(videoId)){
        throw new ApiError(400,"video Id is invalid");
    }

    //getAggrregation

    const video = await Video.aggregate(
        [
            {
                $match:{
                    _id: new mongoose.Types.ObjectId(videoId),
                }
            },
            {
                $lookup:{
                    from:"comments",
                    localField:"_id",
                    foreignField:"video",
                    as:"comments",
                }
            },
            {
                $lookup:{
                    from:"users",
                    localField:"owner",
                    foreignField:"_id",
                    as:"owner",
                    pipeline:[
                      {
                        $project:{
                          fullName: 1
                        }
                      }
                    ]
                }
            },
            {
                $lookup:{
                    from: "likes",
                    localField:"_id",
                    foreignField:"video",
                    as:"likes",
                }
            },
            {
                $addFields: {
                    likes:{
                        $size:"$likes"
                    },
                    owner:{
                        $first:"$owner"
                    },
                    CommentCount: {
                        $size: "$comments"
                    }
                }
            }
    ]);
    
    if(!video){
        throw new ApiError(404,"the videoId provided doesnot exists");
    }

    return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    video,
                    "Video fetched succesfully",
                )
            );

})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail
    const {title, description} = req.body;


    if(!videoId){
        throw new ApiError(401,"videoId is required");
    }

    if(!mongoose.isValidObjectId(videoId)){
        throw new ApiError(401,"not a valid object id");
    }

    if(!title && !description){
        throw new ApiError(401,"all fields are required");
    }

    const updatedVideo = await Video
                               .findByIdAndUpdate(
                                    videoId,
                                    {
                                        $set:{
                                            title,
                                            description,
                                        }
                                    },
                                    {
                                        new:true,
                                    }
                               )
    return res 
           .status(200)
           .json(
            new ApiResponse(
                200,
                updatedVideo,
                "video details updated successfully",
            )
           );

});

const updateVideoThumbnail = asyncHandler(async (req,res) => {
   
    const {videoId} = req.params;

    if(!videoId){
        throw new ApiError(401,"videoId is required");
    }

    if(!mongoose.isValidObjectId(!videoId)){
        throw new ApiError(401,"videoId is invalid");
    }

    const thumbnailLocalFilePath = req.file?.path ;

    //upload new thumbnailLocalFile cloudinary
    const newThumbnail = await uploadOnCloudinary(thumbnailLocalFilePath);

    if(!newThumbnail){
        throw new ApiError(500,"Something went wrong while updating");
    }

    //delete the old thumbnail from cloudinary
        
    const video = await Video.findById(videoId);
    //logic to get the public id
    const temp = video.url.split("/");
    const publicId = temp[temp.length-1].split(".")[0];
    await deleteFromCLoudinary(publicId);

    //update the video in the db

    const updatedVideo = await Video 
                                .findByIdAndUpdate(
                                    videoId,
                                    {
                                        $set: {
                                            
                                        }
                                    },
                                    {
                                        new:true,
                                    }
                                );
    return res 
           .status(200)
           .json(
            new ApiResponse(
                200,
                updatedVideo,
                "thumbnail upated successfully",
            )
           );
    
});

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video

    if(!videoId){
        throw new ApiError(401,"videoId is required")
    }
    if(!mongoose.isValidObjectId(videoId)){
        throw new ApiError(40,"videoId is invalid");
    }

    //check for the ownership

    const video  = await Video.findById(videoId);

    if(!video){
        throw new ApiError(404,"Video does not exists");
    }

    if(!video._id.equals(req.user._id)){
        throw new ApiError(403,"You are authorized for this request");
    }

    video.isPublished = !video.isPublished;

    video.save({validateBeforeSave: false});
    
    return res 
           .status(200)
           .json(
                new ApiResponse(
                    200,
                    {},
                    "Video isPublished toggled"
                )
           );
    

});

const deleteVideo = asyncHandler(async (req, res) => {

    const { videoId } = req.params;

    if(!videoId){
        throw new ApiError(401, "VideoId is required");
    }
    if(!mongoose.isValidObjectId(videoId)){
        throw new ApiError(401,"VideoId is invalid");
    }

    // check for the ownership of the video

    const video = await Video.findById(videoId);

    if(!video){
        throw new ApiError(404,"The video doest not exists");
    }

    if(!video._id.equals(req.user._id)){
        throw new ApiError(403,"You are not authorized to delete this video");
    }

    //delete the video

    await Video.findByIdAndDelete(videoId);
    await Comment.deleteMany({video:videoId});
    await Like.deleteMany({video:videoId});
    
    return res 
           .status(200)
           .json(
            new ApiResponse(
                200,
                {},
                "video deleted successfully"
            )
           )


})

export {
    getAllVideosOfUser,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus,
    updateVideoThumbnail
}

