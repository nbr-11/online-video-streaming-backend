import mongoose, {Schema} from "mongoose";
import { Like } from "./like.model";



const tweetSchema = new mongoose.Schema(
    {
        content: {
            type: String,
            required: true,
        },
        owner: {
            type: Schema.Types.ObjectId,
            ref: "User",
        }
    },
    {
        timestamps: true,
    }
)


tweetSchema.pre('deleteMany', async function(next){
    await  Like.deleteMany({tweet:this._id});
    next();
});

export const Tweet = mongoose.model("Tweet",tweetSchema);