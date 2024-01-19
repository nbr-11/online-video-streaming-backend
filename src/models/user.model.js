import mongoose, {Schema} from "mongoose";
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { Video } from "./video.model.js";
import { Like } from "./like.model.js";
import { Tweet } from "./tweet.model.js";
import { Comment } from "./comment.model.js";

const userSchema = new Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true, // since we are going to use this for searching (this will make it optimum)
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        fullName: {
            type: String,
            required: true,
            trim: true,
            index:true,
        },
        avatar: {
            type: String, // cloudinary url or we can use aws
            required: true,
        },
        coverImage: {
            type: String,
        },
        watchHistory: [
            {
                type: Schema.Types.ObjectId,
                ref: "Video"
            }
        ],
        password: {
            type: String,
            required: [true, "Password is required"]
        },
        refreshToken: {
            type: String
        }
    },
    {
        timestamps:true,
    }
);



userSchema.pre('remove', async function(next){
    
    console.log("console log");
    const deletedComment = await Comment.deleteMany({owner:this._id});
    const deletedLikes = await Like.deleteMany({owner:this._id});
    const deletedVideos = await Video.deleteMany({owner:this._id});
    const deletedTweets = await Tweet.deleteMany({owner:this._id});
    console.log("this is me");
    console.log(deletedComment, deletedLikes, deletedVideos, deletedTweets);
    next();
});


userSchema.pre('save', async function (next){
    
    if(!this.isModified("password")){
       return next();
    }

    this.password = await bcrypt.hash(this.password,10);
    next();
});

userSchema.methods.isPasswordCorrect = async function(password){

    return await bcrypt.compare(password, this.password);
}


userSchema.methods.generateAccessToken = function(){
    return jwt.sign(
        {
            _id:this._id,
            email: this.email,
            username: this.username,
            fullName: this.fullName,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    );
}

userSchema.methods.generateRefreshToken = function(){
    return jwt.sign(
        {
            _id:this._id,

        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}


export const User = mongoose.model("User",userSchema);