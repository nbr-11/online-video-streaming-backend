import mongoose, {Schema} from "mongoose";
import { mailSender } from "../utils/mailSender.js";
import SendmailTransport from "nodemailer/lib/sendmail-transport/index.js";
import { ApiError } from "../utils/ApiError.js";

const otpSchmea = new Schema(
    {

        email:{
            type:String,
            required:true,
        },
        otp:{
            type:String,
            required:true,
            unique:true,
        },
        createdAt:{
            type: Date,
            required:true,
            default: Date.now,
            expires: "1m",
        }

    }
);



otpSchmea.pre("save", async function (next) {
      try{

        const body = `
            <h1>Otp for email verification :</h1>
            <br/>
            <br/>
            <h2>${this.otp}</h2>
            <br/>
            <br/>
            <>Please note that this otp will expire in 2 minutes</>
        `
        const sentMailResponse = await mailSender(this.email, "Email verification",body);

        if(sentMailResponse){
            next();
        } else{
            throw new ApiError(500,"Something went wrong while sending the email with the otp");
        } 

      } catch (error){

            throw new ApiError(500,"Something went wrong while sending the email with the otp");

      }
});



const Otp = mongoose.model('Otp',otpSchmea);

export {Otp};