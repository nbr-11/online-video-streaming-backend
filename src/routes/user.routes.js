import { Router } from "express";
import { changeCurrentPassord, 
    getCurrentUser, 
    getUserChannelProfile, 
    getWatchHistory, 
    loginUser, 
    logoutUser, 
    refreshAccessToken, 
    registerUser, 
    updateAccountDetails, 
    updateEmail, 
    updateUserAvatar, 
    updateUserCoverImage, 
    deleteUser
} from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { generateOtp } from "../controllers/user.controller.js";

const router = Router();

router.route("/register").post(
    upload.fields([
        {
            name:"avatar",
            maxCount: 1
        },
        {
            name:"coverImage",
            maxCount: 1 
        }
    ]),
    registerUser
)

router
.route('/register/generate-otp')
.post(generateOtp)

router
.route("/login")
.post(loginUser);


// secured routes
router
.route('/logout').post(verifyJWT, logoutUser);

router
.route('/refresh-token')
.post(refreshAccessToken);

router
.route('/change-password')
.post(verifyJWT, changeCurrentPassord);

router
.route('/current-user')
.get(verifyJWT, getCurrentUser);

router
.route('/update-account-details')
.patch(verifyJWT, updateAccountDetails);

router
.route('/update-email')
.patch(verifyJWT,updateEmail);

router
.route('/update-avatar')
.patch(
    verifyJWT,
    upload.single("avatar"),
    updateUserAvatar,
);

router
.route('/update-coverimage')
.patch(
    verifyJWT,
    upload.single("coverImage"),
    updateUserCoverImage,
);

router
.route('/channel/:username')
.get(verifyJWT, getUserChannelProfile);

router
.route('/watch-history')
.get(verifyJWT,getWatchHistory);



router 
.route('/delete-account')
.delete(verifyJWT, deleteUser);



export default router;