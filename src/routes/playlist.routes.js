import express from "express"
import { addVideoToPlaylist, createPlaylist, deletePlaylist, getPlaylistById, getUserPlaylists, removeVideoFromPlaylist, updatePlaylist } from "../controllers/playlist.controller";
import { verifyJWT } from "../middlewares/auth.middleware";

const router  = express.Router();


router
.route("/create-playlist")
.post(verifyJWT, createPlaylist);

router
.route("/get-user-playlists/:userId")
.post(verifyJWT, getUserPlaylists);


router
.route("/get-playlist-by-id/:playlistId")
.post(verifyJWT, getPlaylistById);

router
.route("/add-videoTo-Playlist/:playlistId/:videoId")
.post(verifyJWT,addVideoToPlaylist);

router
.route("/remove-videofrom-playlist/:playlistId/:videoId")
.post(verifyJWT,removeVideoFromPlaylist);


router
.route("/deleteplaylist/:playlistId")
.post(verifyJWT,deletePlaylist);

router
.route("/updatePlaylist/:playlistId")
.post(verifyJWT,updatePlaylist);


export default router;


