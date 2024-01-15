import express from "express"
import { addVideoToPlaylist, createPlaylist, deletePlaylist, getPlaylistById, getUserPlaylists, removeVideoFromPlaylist, updatePlaylist } from "../controllers/playlist.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router  = express.Router();


router
.route("/createplaylist")
.post(verifyJWT, createPlaylist);

router
.route("/get-user-playlists/:userId")
.get(verifyJWT, getUserPlaylists);


router
.route("/get-playlist-by-id/:playlistId")
.get(verifyJWT, getPlaylistById);

router
.route("/add-videoTo-Playlist/:playlistId/:videoId")
.patch(verifyJWT,addVideoToPlaylist);

router
.route("/remove-videofrom-playlist/:playlistId/:videoId")
.patch(verifyJWT,removeVideoFromPlaylist);


router
.route("/deleteplaylist/:playlistId")
.delete(verifyJWT,deletePlaylist);

router
.route("/updatePlaylist/:playlistId")
.patch(verifyJWT,updatePlaylist);


export default router;


