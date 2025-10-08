const ErrorHandler=require("../utils/errorHandler");
const catchAsyncErrors=require("../middleware/catchAsyncErrors");
const User=require("../models/userModel");
const sendToken=require("../utils/jwtToken");
const sendEmail=require("../utils/sendEmail");
const crypto=require("crypto");


//Register a user
exports.registerUser=catchAsyncErrors(async(req,res,next)=>{
    const {name,email,password}=req.body;
    const user=await User.create({
        name,
        email,
        password,
        avatar:{
            public_id:"this is a sample id",
            url:"profilepicUrl",
        },
    });
    sendToken(user,201,res);
    });



//Login User
exports.loginUser=catchAsyncErrors(async(req,res,next)=>{
    const {email,password}=req.body;
    //checking if user has given password and email both
    if(!email || !password){
        return next(new ErrorHandler("Please enter email & password",400));
    }
    const user=await User.findOne({email}).select("+password"); //to get password also as in userModel.js select is false for password
    if(!user){
        return next(new ErrorHandler("Invalid email or password",401));
    }
    const isPasswordMatched=await user.comparePassword(password);
    if(!isPasswordMatched){
        return next(new ErrorHandler("Invalid email or password",401));
    }   
    sendToken(user,200,res);
    });

    //logout user
    exports.logoutUser=catchAsyncErrors(async(req,res,next)=>{
        res.cookie("token",null,{
            expires:new Date(Date.now()),
            httpOnly:true,
        });
        res.status(200).json({
            success:true,
            message:"Logged Out",
        });
    });

    //forgot password
    exports.forgotPassword=catchAsyncErrors(async(req,res,next)=>{
        const user=await User.findOne({email:req.body.email});
        if(!user){
            return next(new ErrorHandler("User not found with this email",404));
        }   
        //Get reset token
        const resetToken=user.getResetPasswordToken();
        
        await user.save({validateBeforeSave:false});
        //Create reset password url
        const resetUrl=`${req.protocol}://${req.get("host")}/password/reset/${resetToken}`;
        
        const message=`Your password reset token is as follow:\n\n${resetUrl}\n\nIf you have not requested this email, then please ignore it.`;
        
        try{
            await sendEmail({
                email:user.email,
                subject:`E-commerce Password Recovery`,
                message,
            });
            res.status(200).json({
                success:true,
                message:`Email sent to ${user.email} successfully`,
            });
        }catch(error){
            user.resetPasswordToken=undefined;
            user.resetPasswordExpire=undefined;
            await user.save({validateBeforeSave:false});
            return next(new ErrorHandler(error.message,500));
        }
    });


    //Reset Password
    exports.resetPassword=catchAsyncErrors(async(req,res,next)=>{
        //Hash URL token    
        const resetPasswordToken=crypto.createHash("sha256").update(req.params.token).digest("hex");
        const user=await User.findOne({
            resetPasswordToken,
            resetPasswordExpire:{$gt:Date.now()},
        });
        if(!user){
            return next(new ErrorHandler("Reset Password Token is invalid or has been expired",400));
        }
        if(req.body.password!==req.body.confirmPassword){
            return next(new ErrorHandler("Password does not match",400));
        }
        user.password=req.body.password;
        user.resetPasswordToken=undefined;
        user.resetPasswordExpire=undefined;
        await user.save();
        sendToken(user,200,res);
    });

    //Get User Details
    exports.getUserDetails=catchAsyncErrors(async(req,res,next)=>{
        const user=await User.findById(req.user.id);
        res.status(200).json({
            success:true,
            user,
        });
    });

    //Update User Password
    exports.updatePassword=catchAsyncErrors(async(req,res,next)=>{
        const user=await User.findById(req.user.id).select("+password");
        const isPasswordMatched=await user.comparePassword(req.body.oldPassword);

        if(!isPasswordMatched){
            return next(new ErrorHandler("Old password is incorrect",400));
        }

        if(req.body.newPassword!==req.body.confirmPassword){
            return next(new ErrorHandler("Password does not match",400));
        }
        user.password=req.body.newPassword;
        await user.save();
        sendToken(user,200,res);
    });

    //update user profile
    exports.updateProfile=catchAsyncErrors(async(req,res,next)=>{
        const newUserData={
            name:req.body.name,
            email:req.body.email,
        }
        //We will add cloudinary later
        const user=await User.findByIdAndUpdate(req.user.id,newUserData,{
            new:true,
            runValidators:true, //to run the validators defined in userModel.js
            useFindAndModify:false,
        });
        res.status(200).json({
            success:true,
        });
    });

    //Get all users(admin)
    exports.getAllUser=catchAsyncErrors(async(req,res,next)=>{
        const users=await User.find();
        res.status(200).json({
            success:true,
            users,
        });
    });

    //Get single user(admin)
    exports.getSingleUser=catchAsyncErrors(async(req,res,next)=>{
        const user=await User.findById(req.params.id);
        if(!user){
            return next(new ErrorHandler(`User does not exist with Id: ${req.params.id}`));
        }
        res.status(200).json({
            success:true,
            user,
        });
    });

    //update user role -- admin
    exports.updateUserRole=catchAsyncErrors(async(req,res,next)=>{
        const newUserData={
            name:req.body.name,
            email:req.body.email,
            role:req.body.role,
        }
        //We will add cloudinary later
        const user=await User.findByIdAndUpdate(req.params.id,newUserData,{
            new:true,
            runValidators:true, //to run the validators defined in userModel.js
            useFindAndModify:false,
        });
        if(!user){
            return next(new ErrorHandler(`User does not exist with Id: ${req.params.id}`));
        }
        res.status(200).json({
            success:true,
        });
    });

    //Delete user -- admin
    exports.deleteUser=catchAsyncErrors(async(req,res,next)=>{
        const user=await User.findById(req.params.id);
        if(!user){
            return next(new ErrorHandler(`User does not exist with Id: ${req.params.id}`));
        }
        //We will remove cloudinary later
        await user.deleteOne();
        res.status(200).json({
            success:true,
            message:"User Deleted Successfully",
        });
    });