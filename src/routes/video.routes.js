import express from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { publishAVideo } from "../controllers/video.controller.js";
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

export default router;