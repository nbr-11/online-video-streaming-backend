import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";

const healthCheck = asyncHandler(async(req,res) => {
    return res 
           .status(200)
           .json(
                new ApiResponse(
                    200,
                    {},
                    "Ok"
                )
           );
})

export {healthCheck};