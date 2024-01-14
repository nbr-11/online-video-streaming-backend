import express from "express";
import { addComment, deleteComment, getVideoComments, updateComment } from "../controllers/comment.controller.js";
import {verifyJWT} from "../middlewares/auth.middleware.js"

const router = express.Router();

router.route("/getvideocomments").get(verifyJWT,getVideoComments);
router.route("/addcomment").get(verifyJWT,addComment);
router.route("/updatecomment/:commentId").get(verifyJWT,updateComment);
router.route("/deletecomment/:commentId").get(verifyJWT,deleteComment);

export default router;
