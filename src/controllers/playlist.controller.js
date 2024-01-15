import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body

    //TODO: create playlist
    if(!name){
        throw new ApiError(401,"name is required");
    }

    if(!description){
        throw new ApiError(401,"name is required");
    }

    //i will allow an empty playlist (validateBeforeSave:false)

    const createdPlaylist = new Playlist();

    createdPlaylist.name = name;
    createdPlaylist.description = description;

    const resposne = await createdPlaylist.save({validateBeforeSave:false});

    

    return res 
           .status(200)
           .json(
                 new ApiResponse(
                    200,
                    resposne,
                    "Playlist created",
                 )
           );

    
});

const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params
    //TODO: get user playlists

    if(!userId){
        throw new ApiError(401,"UserId is required");
    }
    if(!isValidObjectId(userId)){
        throw new ApiError(401,"UserId is invalid");
    }

    const userPlaylists = await Playlist.find({owner:userId});

   return res 
          .status(200)
          .json(
            new ApiResponse(
                200,
                userPlaylists,
                "User's playlist fetched",
            )
          );
});

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params

    if(!playlistId){
        throw new ApiError(401,"playlist id is required");
    }

    if(!isValidObjectId(playlistId)){
         throw new ApiError(401,"playlist id is invalid");
    }

    const playlist = await Playlist.aggregate([
        {
            $match:{
                _id: new mongoose.Types.ObjectId(playlistId),
            }
        },
        {
            $lookup:{
                from :"videos",
                localField:"videos",
                foreignField:"_id",
                as:"videos",
            }
        },
        {
            $lookup:{
                from: "users",
                localField:"owner",
                foreignField:"_id",
                as:"owner",
                pipeline:[
                    {
                        $project:{
                            username:1,
                            email:1,
                            fullName:1,
                            avatar: 1,
                            coverImage:1,
                            
                        }
                    }
                ]
            }
        },
        {
            $addFields:{
                owner:{
                    $first:"$owner",
                }
            }
        }
    ]);

    return res 
           .status(200)
           .json(
                new ApiResponse(
                    200,
                    playlist,
                    "playlist fetched",
                )
           )

});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    // use the $push operator
    if(!playlistId || !videoId){
        throw new ApiError(401,"Both playlistId and videoId are required");
    }

    if(!isValidObjectId(playlistId)){
        throw new ApiError(401,"playlistid is not valid");
    }

    if(!isValidObjectId(videoId)){
        throw new ApiError(401,"videoId is not valid");
    }

    const updatedPlaylist  = await Playlist
                                    .findByIdAndUpdate(
                                        playlistId,
                                        {
                                            $push:{
                                                videos:videoId
                                            }
                                        },
                                        {
                                            new: true,
                                        }
                                    );
    
    return res 
           .status(200)
           .json(
                new ApiResponse(
                    200,
                    updatePlaylist,
                    "Video added to the playlist"
                )
           );
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    // TODO: remove video from playlist
    // $pull operator

    if(!playlistId || !videoId){
        throw new ApiError(401,"Both playlistId and videoId are required");
    }

    if(!isValidObjectId(playlistId)){
        throw new ApiError(401,"playlistid is not valid");
    }

    if(!isValidObjectId(videoId)){
        throw new ApiError(401,"videoId is not valid");
    }

    const updatedPlaylist  = await Playlist
                                    .findByIdAndUpdate(
                                        playlistId,
                                        {
                                           $pull:{
                                                videos:videoId
                                           }
                                        },
                                        {
                                            new: true,
                                        }
                                    );
    
    return res 
           .status(200)
           .json(
                new ApiResponse(
                    200,
                    updatedPlaylist,
                    "Video removed from the playlist"
                )
           );

});

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    // TODO: delete playlist

    //easy like before just check the ownership and delete

    //here just delete the playlist don't delete the videos from the database

    if(!playlistId){
        throw new ApiError(401,"Both playlistId and videoId are required");
    }

    if(!isValidObjectId(playlistId)){
        throw new ApiError(401,"playlistid is not valid");
    }

    const deletedPlaylist = await Playlist 
                                    .findByIdAndDelete(playlistId);

    return res 
             .status(200)
             .json(
                    new ApiResponse(
                        200,
                        {},
                        "playlist deleted successfully",
                    )
             )


});

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body


    if(!playlistId){
        throw new ApiError(401,"Both playlistId and videoId are required");
    }

    if(!isValidObjectId(playlistId)){
        throw new ApiError(401,"playlistid is not valid");
    }


    //TODO: update playlist

    const updatedPlaylist = await Playlist 
                                    .findByIdAndUpdate(
                                        playlistId,
                                        {
                                            $set:{
                                                name,
                                                description,
                                            }
                                        },
                                        {
                                            new: true,
                                        }
                                    );
    
    return res 
           .status(200)
           .json(
                new ApiResponse(
                    200,
                    updatedPlaylist,
                    "playlist updated successfully",
                )
           );
});


export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}

