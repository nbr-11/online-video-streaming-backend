import express from "express";
import { toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike } from "../controllers/like.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";


const router  = express.Router();


router.route('/togglevideolike/:videoId').post(verifyJWT, toggleVideoLike);
router.route('/togglecommentlike/:commentId').post(verifyJWT, toggleCommentLike);
router.route('/toggletweetlike/:tweetId').post(verifyJWT, toggleTweetLike);
router.route('/getlikedvideos').get(verifyJWT, toggleTweetLike);


export default router;

