import express from "express";
import { createTweet, 
    deleteTweet, 
    getUserTweets, 
    updateTweet } from "../controllers/tweet.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";


const router = express.Router();


router.route("/create-tweet").post(verifyJWT,createTweet);
router.route("/user/tweet/:userId").get(verifyJWT,getUserTweets);
router.route("/update-tweet/:tweetId").patch(verifyJWT,updateTweet);
router.route("/delete-tweet/:tweetId").delete(verifyJWT,deleteTweet);



export default router;