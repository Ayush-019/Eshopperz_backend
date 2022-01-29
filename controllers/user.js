const User = require("../models/userModel");
const ErrorHandler = require("../utils/errorhandler");
const asyncErrors = require("../Middlewares/asyncErrors");
const sendToken = require("../utils/jwtToken");
const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto");
const cloudinary = require("cloudinary");

//User Register
exports.registerUser = asyncErrors(async (req, res, next) => {
  const myCloud = await cloudinary.v2.uploader.upload(req.body.avatar, {
    folder: "avatars",
    width: 150,
    crop: "scale",
  });

  const { name, email, password } = req.body;

  const user = await User.create({
    name,
    email,
    password,
    avatar: {
      public_id: myCloud.public_id,
      url: myCloud.secure_url,
    },
  });

  sendToken(user, 201, res);
});

//LOGIN User
exports.loginUser = asyncErrors(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new ErrorHandler("Please Enter email and password", 400));
  }

  const user = await User.findOne({ email }).select("+password"); //Can't specify password directly as in schema password is selected as false.

  if (!user) {
    return next(
      new ErrorHandler("User doesn't found!!Invalid email or password", 401)
    );
  }

  const isPasswordCheck = await user.comparePassword(password);

  if (!isPasswordCheck) {
    return next(new ErrorHandler("Invalid email or password", 401));
  }

  sendToken(user, 200, res);
});

//LOGOUT User
exports.logout = asyncErrors(async (req, res, next) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    message: "Logged Out Successfully",
  });
});

//Forgot Password
exports.forgotPassword = asyncErrors(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }

  //Get ResetPassword Token
  const resetToken = await user.getResetPasswordToken();
  await user.save({ validateBeforesave: false });

  // const resetUrl = `${req.protocol}://${req.get(
  //   "host"
  // )}/api/v1/password/reset/${resetToken}`;

  const resetUrl = `${req.protocol}://${req.get(
    "host"
  )}/password/reset/${resetToken}`;

  // const resetUrl = `${process.env.FRONTEND_URL}/password/reset/${resetToken}`;

  const message = `Your password reset Token is : \n\n ${resetUrl} \n\n If you have not requested for this email,please ignore it.`;

  try {
    await sendEmail({
      email: user.email,
      subject: "Eshopperz Password Recovery",
      message,
    });
    res.status(200).json({
      success: true,
      message: `Email send to ${user.email} sucessfully`,
    });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save({ validateBeforesave: false });
    return next(new ErrorHandler(error.message, 500));
  }
});

//Reset User Password
exports.resetPassword = asyncErrors(async (req, res, next) => {
  //Converting token to Hash(bcz in database it is stored in hash format)
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return next(
      new ErrorHandler(
        "Reset Password Token has expired!!Send Token again",
        400
      )
    );
  }

  if (req.body.password !== req.body.confirmPassword) {
    return next(
      new ErrorHandler("Password and Confirm Password value doesn't match", 400)
    );
  }

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  sendToken(user, 200, res);
});

// Display User Details
exports.getUser = asyncErrors(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    success: true,
    user,
  });
});

//Update user Profile
exports.updateUserProfile = asyncErrors(async (req, res, next) => {
   const newUserData = {
     name: req.body.name,
     email: req.body.email,
   };

  //  if (req.body.avatar !== "") {
   if (req.body.avatar) {
     const user = await User.findById(req.user.id);

     const imageId = user.avatar.public_id;

     await cloudinary.v2.uploader.destroy(imageId);

     const myCloud = await cloudinary.v2.uploader.upload(req.body.avatar, {
       folder: "avatars",
       width: 150,
       crop: "scale",
     });

     newUserData.avatar = {
       public_id: myCloud.public_id,
       url: myCloud.secure_url,
     };
   }

   const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
     new: true,
     runValidators: true,
     useFindAndModify: false,
   });

   res.status(200).json({
     success: true,
   });
});

//Update user Password
exports.updatePassword = asyncErrors(async (req, res, next) => {
  const user = await User.findById(req.user.id).select("+password");

  const isPasswordCheck = await user.comparePassword(req.body.oldPassword);

  if (!isPasswordCheck) {
    return next(new ErrorHandler("Old Password is incorrect!", 400));
  }

  if (req.body.newPassword !== req.body.confirmPassword) {
    return next(
      new ErrorHandler("Password and Confirm Password doesn't match!", 400)
    );
  }

  user.password = req.body.newPassword;
  await user.save();

  sendToken(user, 200, res);
});

//Get all User Profiles --->Admin accessible only
exports.getAllUsers = asyncErrors(async (req, res, next) => {
  const users = await User.find();

  res.status(200).json({
    success: true,
    users,
  });
});

//Get single User Profiles --->Admin accessible only
exports.getSingleUser = asyncErrors(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(
      new ErrorHandler(`No User exist with id: ${req.params.id}`, 400)
    );
  }

  res.status(200).json({
    success: true,
    user,
  });
});

//Update user role by admin --->Admin accessible only
exports.updateUserRole = asyncErrors(async (req, res, next) => {
    const newUserData = {
      name: req.body.name,
      email: req.body.email,
      role: req.body.role,
    };

    await User.findByIdAndUpdate(req.params.id, newUserData, {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    });

    res.status(200).json({
      success: true,
    });
});

//Delete User --->Admin accessible only
exports.deleteUser = asyncErrors(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(
      new ErrorHandler(`No user exist with id: ${req.params.id}`, 400)
    );
  }

  //Deleting profile images of deleted users from cloudinary.
  const imageId = user.avatar.public_id;
  await cloudinary.v2.uploader.destroy(imageId);

  await user.remove();
  res.status(200).json({
    sucess: true,
    message: "User Deleted Successfully!",
  });
});
