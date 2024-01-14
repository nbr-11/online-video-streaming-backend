import express from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { getAllVideosOfUser, publishAVideo } from "../controllers/video.controller.js";
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

router.route('/get-all-video-of-user').get(verifyJWT,getAllVideosOfUser);

export default router;