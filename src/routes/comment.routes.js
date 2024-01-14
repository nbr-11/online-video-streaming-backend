import express from "express";
import { addComment, deleteComment, getVideoComments, updateComment } from "../controllers/comment.controller.js";
import {verifyJWT} from "../middlewares/auth.middleware.js"

const router = express.Router();

router.route("/getvideocomments/:videoId").get(verifyJWT,getVideoComments);
router.route("/addcomment/:videoId").post(verifyJWT,addComment);
router.route("/updatecomment/:commentId").post(verifyJWT,updateComment);
router.route("/deletecomment/:commentId").delete(verifyJWT,deleteComment);

export default router;


