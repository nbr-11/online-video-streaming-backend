import express from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { 
    addVideoToUserWatchHistory,
    deleteVideo, 
    getAllVideo, 
    getAllVideosOfUser, 
    getVideoById,
    publishAVideo, 
    togglePublishStatus, 
    updateVideo,
    updateVideoThumbnail
} from "../controllers/video.controller.js";

import { upload } from "../middlewares/multer.middleware.js";


const router  = express.Router();

router.route('/uploadvideo').post(
    upload.fields([
        {
            name:"video",
            maxCount:1
        },
        {
            name:"thumbnail",
            maxCount:1
        }
    ]),
    verifyJWT,
    publishAVideo);

router
.route('/get-all-video-of-user')
.get(verifyJWT,getAllVideosOfUser);

router
.route('/get-all-video')
.get(verifyJWT,getAllVideo);


router
.route('/getvideobyid/:videoId')
.get(verifyJWT,getVideoById);

router
.route('/updatevideo/:videoId')
.patch(verifyJWT,updateVideo);

router
.route(
    upload.single('thumbnail'),
    '/updatevideothumbnail/:videoId')
.patch(verifyJWT,updateVideoThumbnail);

router
.route('/togglepublishstatus/:videoId')
.patch(verifyJWT,togglePublishStatus);

router
.route('/deletevideo/:videoId')
.delete(verifyJWT,deleteVideo);


router 
.route('/addvideotowatchhistory/:videoId')
.patch(verifyJWT,addVideoToUserWatchHistory);



export default router;

