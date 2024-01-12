import {v2 as cloudinary} from "cloudinary";
import cluster from "cluster";
import fs from "fs";
       
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET,
});


const uploadOnCloudinary = async (localFilePath) => {
    try{

      if(!localFilePath) return null

      //upload the file on cloudinary

     const response =  await cloudinary.uploader.upload(localFilePath,{
         resource_type:"auto",
      });

      //file has been uploaded successfully
      // console.log(response);//only for testing
      // console.log("File uploaded on cloudinary successfully");
     
      fs.unlinkSync(localFilePath);
      
      return response;


    } catch(error){

      fs.unlinkSync(localFilePath);

      return null;

    }
}


const deleteFromCLoudinary = async(cloudinaryUrl) => {
  try{

    if(!cloudinaryUrl) return null;

    const response = await cloudinary.uploader.destroy(cloudinaryUrl);

    return response;

  } catch(error){
    return null
  }
};

export {uploadOnCloudinary, deleteFromCLoudinary};