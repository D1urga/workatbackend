import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { generateOTP, transporter } from "../utils/utilFunctions.js";

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "something went wrong while generating token");
  }
};

const registerUser = asyncHandler(async (req, res) => {
  const { username, fullname, email, password } = req.body;
  if (
    [username, email, password].some((field) => {
      field?.trim() === "";
    })
  ) {
    throw new ApiError(400, "all fields required");
  }

  const existedUser = await User.findOne({ $or: [{ username }, { email }] });
  if (existedUser) {
    res.status(400).json(new ApiResponse(400, "", "user already exits"));
    throw new ApiError(400, "user already exits");
  }

  const otp = generateOTP();
  const user = await User.create({
    username,
    password,
    email,
    otp,
    isVerified: false,
    otpExpiry: Date.now() + 5 * 60 * 1000,
  });
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  if (!createdUser) {
    throw new ApiError(400, "something went wrong");
  }
  const mailOptions = {
    from: "anupchaudhary1021@gmail.com",
    to: "anupchaudhary1021@gmail.com",
    subject: "OTP verification",
    text: "OTP verification",
    html: `
    <h2>${otp}</h2>
  `,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error:", error);
    } else {
      console.log("Email sent:", info.response);
    }
  });
  res
    .status(200)
    .json(new ApiResponse(200, createdUser, "Verify otp, sent on email"));
});

const verifyOtp = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(400, "user not found");
  }

  if (user.otp !== otp || Date.now() > user.otpExpiry) {
    res.status(400).json(new ApiResponse(400, "", "Invalid or Expire otp"));
    throw new ApiError(400, "Invalid or Expire otp");
  }
  user.isVerified = true;
  user.otp = null;
  user.otpExpiry = null;
  await user.save();

  res.status(200).json(new ApiResponse(200, user, "verified successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, username, password } = req.body;

  if (!username && !email) {
    throw new ApiError(400, "username or email required");
  }
  const user = await User.findOne({ $or: [{ username }, { email }] });
  if (!user) {
    res
      .status(400)
      .json(new ApiResponse(400, "", "user does not exits, signup first"));
    throw new ApiError(404, "user does not exits");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    res.status(400).json(new ApiResponse(400, "", "invalid user credentials"));
    throw new ApiError(401, "invalid user credentials");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  );
  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  return res
    .status(200)
    .cookie("accessToken", accessToken, {
      expires: new Date(Date.now() + 30 * 24 * 3600000),
      httpOnly: true,
      secure: true,
      sameSite: "none",
    })
    .cookie("refreshToken", refreshToken, {
      expires: new Date(Date.now() + 30 * 24 * 3600000),
      httpOnly: true,
      secure: true,
      sameSite: "none",
    })
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "user logged in successfully"
      )
    );
});

export { registerUser, verifyOtp, loginUser };
