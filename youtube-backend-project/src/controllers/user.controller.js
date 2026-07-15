import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";


const registerUser = asyncHandler( async (req, res) => {
  // get user detail from the frontend.
  // Validation - not empty
  // Check if user already exist, UserName, Email
  // check for image, check for avatar
  // uplaod then to cloudinary, avatar
  // create user entry, create user in db
  // remove password and refresh token faild from response
  // check for user creation 
  // reutrn response


  const {fullName, email, userName, password} = req.body
  console.log("email: ", email);

  if(
    [fullName, email, userName, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required")
  }

  const existedUser = User.findOne({
    $or: [{ userName },{ email }]
  })

  if(existedUser) {
    throw new ApiError(409, "User with email or userName already exist")
  }

  const avatarLocalPath = req.files?.avatar[0]?.path
  const coverImageLocalPath = req.files?.coverImage[0]?.path

  if(!avatarLocalPath){
    throw new ApiError(400, "Avater file is required")
  }

  const avatar =  await uploadOnCloudinary(avatarLocalPath)
  const coverImage =  await uploadOnCloudinary(coverImageLocalPath)

  if(!avatar){
    throw new ApiError(400, "Avater file is required")
  }

  const user =  await User.creat({
    userName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    userName: userName.toLowerCase()
  })

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken "
  )

  if(!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user")
  }

  return res.status(201).json(
    new ApiResponse(200, createdUser, "User Registered Succesfully")
  )


})

export {registerUser}