import {asyncHandler} from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";


const generateAccessAndRefreshToken = async (userId) =>{
    try{

       const user = await User.findById(userId);
       const accessToken = user.generateRefreshToken();
       const refreshToken = user.generateAccessToken();

       user.refreshToken = refreshToken;
       await user.save({validateBeforeSave: false});
      
      return {accessToken,refreshToken};

    } catch (error) {
      throw new ApiError(500,"Something went wrong while generating access and refresh tokens");  
    }
}


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

     if(!avatar){
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

const loginUser = asyncHandler(async (req,res) => {
     
   //   extract data from req.body
   const {email, username, password} = req.body;

   //   username or email
   if(!email && !username){
      throw new ApiError(400,"username or email is required");
   }

   //   find the user
  const user =  await User.findOne({
      $or:[{email},{username}]
   });
   
   if(!user){
      throw new ApiError(404,"Usre does not exists");
   }

    //   compare the password
   const isPasswordValid = await user.isPasswordCorrect(password);

   if(!isPasswordValid){
      throw new ApiError(401,"Invalid user credentials");
   }

   //   access and refresh token generation
   const {accessToken, refreshToken} = await generateAccessAndRefreshToken(user._id);

   
   const loggedInUser = User.findById(user._id).select("-password -refreshToken");

   //send cookies

   const options = {
      httpOnly:true,
      secure: true,
   }

   return res
          .status(200)
          .cookie("accessToken",accessToken, options)
          .cookie("refreshToken",refreshToken, options)
          .json(
            new ApiResponse(
               200,
               {
                  user:loggedInUser,
                  accessToken, 
                  refreshToken
               },
               "User logged In Successfully")
          );
});


const logoutUser  = asyncHandler(async (req,res) => {
   
   await User.findByIdAndUpdate(
      req.user._id,
      {
         $set: {
            refreshToken: undefined
         }
      },
      {
         new: true,
      }
   );

   const options = {
      httpOnly: true,
      secure: true,
   }

   return res
          .status(200)
          .clearCookie("accessToken",options)
          .clearCookie("refreshToken",options)
          .json(
               new ApiResponse(
                  200,
                  {},
                  "User logged Out"
               )
          )
});


const refreshAccessToken = asyncHandler(async (req, res) => {

   const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

   if(!incomingRefreshToken) {
      throw new ApiError(401, "unauthorized request");
   }

    try {
      const decodedToken = jwt.verify(
        incomingRefreshToken,
        process.env.REFRESH_TOKEN_SECRET
     );
  
     const user = await User.findById(decodedToken?._id);
     
     if(!user){
        throw new ApiError(401,"Invalid refresh token");
     }
  
     if(incomingRefreshToken !== user?.refreshToken){
        throw new ApiError(401,"Refresh token exprired or used ");
     }
  
     const {accessToken, newRefreshToken} = await generateAccessAndRefreshToken(user?._id);
  
     const options = {
        httpOnly: true,
        secure: true,
     }
  
     return res 
            .status(200)
            .cookie('accessToken',accessToken,options)
            .cookie('refreshToken',refreshToken,options)
            .json(
              new ApiResponse(
                 200,
                 {
                    accessToken,
                    refreshToken:newRefreshToken,
                 },
                 "Access token refreshed"
              )
            );
  
    } catch (error) {
       throw new ApiError(401,error?.message || "Invalid refresh token");
    }

});

export {
   registerUser,
   loginUser,
   logoutUser,
   refreshAccessToken,

};
