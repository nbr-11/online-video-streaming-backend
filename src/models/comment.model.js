import mongoose, {Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
import { Like } from "./like.model";

const commentSchema = new Schema(
    {
        content: {
            type: String,
            required: true,
        },
        video: {
            type: Schema.Types.ObjectId,
            ref: "Video",
        },
        owner: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },

    },
    {
        timestamps: true,
    }
);


commentSchema.pre('deleteMany', async function(next){
    await Like.deleteMany({comment:this._id});

    next();
});

commentSchema.plugin(mongooseAggregatePaginate);


export const Comment = mongoose.model("Comment",commentSchema);

