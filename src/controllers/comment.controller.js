import mongoose from "mongoose"
import {Comment} from "../models/comment.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query

    if(!videoId){
        throw new ApiError(401,"videoId is required");
    }

    if(!mongoose.isValidObjectId(videoId)){
        throw new ApiError(401, "videoId is not valid");
    }

    //options
    const options= {
        page,
        limit
    }

    //aggragate query
   const videoComment = Comment.aggregate([
        {
            $match:{
                video:videoId
            }
        }
    ]);

    //implementing pagination
    const response = await Comment.aggregatePaginate(videoComment, options);

    return res 
           .status(200)
           .json(
            new ApiResponse(
                200,
                response,
                "comment for this video fetched successfully",

            )
           );
    

});

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video

    const {videoId} = req.params;

    const {content} = req.body;

    if(!videoId){
        throw new ApiError(401,"videoId is required");
    }

    if(!mongoose.isValidObjectId(videoId)){
        throw new ApiError(401,"videoId is invalid");
    }

    const createdComment = await Comment.create(
        {
            content,
            owner:req.user._id,
            video:videoId
        }
    );


    return res 
           .status(200)
           .json(
                new ApiResponse(
                    200,
                    createdComment,
                    "comment added successfully"
                )
           );

});

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
    //extract the requied details

    const {commentId} = req.params;

    const {content} = req.body;

    //validate them 
    if(!commentId){
        throw new ApiError(401,"commentId is required");
    }

    if(!mongoose.isValidObjectId(commentId)){
        throw new ApiError(401,"commentId is not valid");
    }

    if(!content){
        throw new ApiError(401,"content is required");
    }
    
    //check for the ownership

    const comment = await Comment.findById(commentId);
     
    if(!req.user._id.equals(comment._id)){
        throw new ApiError(403,"You are not authorized to update this comment");
    }

    //create a database entry with the updated content

    const updatedComment = await Comment 
                                 .findByIdAndUpdate(
                                    comment._id,
                                    {
                                        $set:{
                                            content
                                        }
                                    },
                                    {
                                        new:true,
                                    }
                                 );

    //return the response

    return res 
           .status(200)
           .json(
            new ApiResponse(
                200,
                updatedComment,
                "Comment updated succesfully",
            )
           );

});

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    const {commentId} = req.params;
    
    //validate them

    if(!commentId){
        throw new ApiError(401,"commentId is required");
    }

    if(!mongoose.isValidObjectId(commentId)){
        throw new ApiError(401,"commentId is not valid");
    }

    //check for the ownerShip

    const comment = await Comment.find(commentId);

    if(!req.user._id.equals(comment._id)){
        throw new ApiError(403,"You are not authorized to delete this deleteComment");
    }

    //create a database entry with the updated content

    const deletedComment = await Comment.findByIdAndDelete(commentId);
    
    //retun the response

    return res
           .status(200)
           .json(
            new ApiError(
                200,
                deletedComment,
                "Comment deleted successfully",
            )
           );
});


export {
    getVideoComments, 
    addComment, 
    updateComment,
     deleteComment
}

