import {asyncHandler} from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asyncHandler(async (req,res) => {

    // get user details from frontend
    const {fullName, email, username, password} = req.body;
    
    // validations
    if([fullName,email,username,password].some((field)=>{
       return field?.trim() === ""
    })){

        throw new ApiError(400,"All fields are required");
    }

    //can add more custom validations


    // check is user already exists

    const existingUser = await User.findOne({
        $or: [{ email },{ username }]
     });
    
     if(existingUser){
        throw new ApiError(409,"username or email is already registered")
     }

    
    // check for images, check for avatar

    const avatarLocalFilePath = req.files?.avatar?.[0]?.path;
    const coverImageLocalFilePath = req.files?.coverImage?.[0]?.path;

    if(!avatarLocalFilePath){
        throw new ApiError(400,"Avatar file is required");
    }
    
    // upload them to cloudinary (store the reference)

    const avatar = await uploadOnCloudinary(avatarLocalFilePath);
    const coverImage = await uploadOnCloudinary(coverImageLocalFilePath);

    // check whether the avatar was uploaded to cloudinary

     if(! avatar){
        throw new ApiError(400,"Avatar file is required");
     }

    // create user object - create entry in db

    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        username: username.toLowerCase(),
        password
    });

    // check for user creation (may be unOptimal but it will make sure that there are no errors)
    // remove password and refresh token field from response

    const createdUser = await User.findById(user?._id).select(
        "-password -refreshToken"
     );

     if(!createdUser){
        throw new ApiError(500,"Something went wrong while creating a user");
    }

     // return response
    
     return res.status(201).json(
        new ApiResponse(201,createdUser,"User registered successfully")
     );

});

 

export {registerUser};