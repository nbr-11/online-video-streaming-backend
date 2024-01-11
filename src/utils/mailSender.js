import nodeMailer from "nodemailer";
import { ApiError } from "./ApiError.js";

const transporter = nodeMailer.createTransport({
    host: process.env.MAIL_HOST,
    port: 465,
    secure: true,
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });

const mailSender  = async (receiverMail, subject, body) => {
   try{

        const sentMailInfo = await transporter.sendMail(
            {

                from : "Videotube",
                to : `${receiverMail}`,
                subject: `${subject}`,
                html: `${body}`,

            }
        )

        return sentMailInfo;
     
   } catch(error){
        new ApiError(500,"Something went wrong while sending the email")

        return null;
   }
}


export {mailSender};
  