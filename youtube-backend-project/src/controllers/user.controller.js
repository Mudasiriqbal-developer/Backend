import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";

// Generate Access and refresh tokens
const generateAccessAndRefreshToken = async(userId) => 
{
  try {
    const user = await User.findById(userId)
    const accessToken = user.generateAccessToken()
    const refreshToken = user.generateRefreshToken()

    user.refreshToken = refreshToken
    await user.save({ validateBeforeSave: false })

    return {
      accessToken, refreshToken
    }


  } catch(error) {
    throw new ApiError(500, "some thing went wrong while generating access and refresh tokens")
  }
}


// User Registration
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
  // console.log("email: ", email);

  if(
    [fullName, email, userName, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required")
  }

  const existedUser = await User.findOne({
    $or: [{ userName },{ email }]
  })

  if(existedUser) {
    throw new ApiError(409, "User with email or userName already exist")
  }

  // console.log(req.files)

  const avatarLocalPath = req.files?.avatar[0]?.path
  // const coverImageLocalPath = req.files?.coverImage[0]?.path

  let coverImageLocalPath;
  if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
    coverImageLocalPath = req.files.coverImage[0].path
  }

  if(!avatarLocalPath){
    throw new ApiError(400, "Avater file is required")
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = coverImageLocalPath ? await uploadOnCloudinary(coverImageLocalPath) : null;

  if (!avatar) {
    throw new ApiError(400, "Avater file is required");
  }

  const user = await User.create({
    userName: userName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    fullName: fullName
  });

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

// User Login
const loginUser = asyncHandler(async, (req, req) => {
  // req body -> data
  // username or email
  // find the user
  // password check
  // access and refresh token
  // send cookie

  const {email, username, password} = req.body

  if(!username || email) {
    throw new ApiError(400, "Email or UserName is required.")
  }

  const user = await User.findOne({
    $or: [{username}, {email}]
  })

  if(!User) {
    throw new ApiError(404, "User does not exist")
  }

  const isPasswordValid = await user.isPasswordCorrect(password)

  if(!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials")
  }

  const {accessToken, refreshToken} = await generateAccessAndRefreshToken(user._id)

  const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

  const option = {
    httpOnly: true,
    secure: true
  }

  return res
  .status(200)
  .cookie("accessToken", accessToken, option)
  .cookie("refreshToken", refreshToken, option)
  .json(
    new ApiResponse(
      200, 
      {
        user: loggedInUser, accessToken, refreshToken
      },
      "User Logged In Successfully"
    )
  )
})

// User Loggout
const logoutUser = asyncHandler(async(req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined
      }
    },
    {
      new: true
    }
  )

  const option = {
    httpOnly: true,
    secure: true
  }

  return res
  .status(200)
  .clearCookie("accessToken", option)
  .clearCookie("refreshToken", option)
  .json(
    new ApiResponse(200, "User Logged out")
  )
})

export {
  registerUser,
  loginUser,
  logoutUser
}