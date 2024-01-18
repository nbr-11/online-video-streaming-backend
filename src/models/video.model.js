import mongoose, {Schema} from "mongoose";
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2';
import {mailSender} from "../utils/mailSender.js"
import { User } from "./user.model.js";
import { Like } from "./like.model.js";
import { deleteFromCLoudinary, deleteVideoFromCLoudinary } from "../utils/cloudinary.js";

const videoSchema = new Schema(
    {
        videoFile:{
            type: String, //cloudinary url
            required: true,
        },
        thumbnail: {
            type: String,
            required: true,
        },
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        duration: {
            type: Number, //cloudinary or aws
            required: true,
        },
        views: {
            type: Number,
            default: 0,
        },
        isPublished: {
            type: Boolean,
            default: true,
        },
        owner: {
            type: Schema.Types.ObjectId,
            ref: 'User',
        }
    },
    {
        timestamps: true,
    }
)



videoSchema.pre('deleteMany', async function (next){
    await Like.deleteMany({video:this._id});
    await Comment.deleteMany({video:this._id});
    await deleteFromCLoudinary(this.thumbnail);
    await deleteVideoFromCLoudinary(this.videoFile);

    next();
});


videoSchema.plugin(mongooseAggregatePaginate); //allow us to write aggrgation queries (pagination)


videoSchema.post('save',async function(document,next){
    
    const body= `
       <h1>Video uploaded successfully</h1>

       <a href=${document.videoFile}> ${document.videoFile}</a>
    
    `
    const user = await User.findById(document.owner);

    const mailResponse = await mailSender(user.email,"Video uploaded successfully",body);

    next();    

});


export const Video = mongoose.model("Video",videoSchema)