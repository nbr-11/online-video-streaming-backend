import mongoose, {Schema} from "mongoose";

import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";


const likeSchema = new Schema(
    {
     video: {
        type: Schema.Types.ObjectId,
        ref: "Video"
     },
     comments: {
        type: Schema.Types.ObjectId,
        ref: "Comment"
     },
     tweets: {
        type: Schema.Types.ObjectId,
        ref: "Tweet",
     },
     likedBy:{
        type:Schema.Types.ObjectId,
        ref: "User"
     }
    },
    {
        timestamps:true,

    }
);


export const Like = mongoose.model("Like",likeSchema);
