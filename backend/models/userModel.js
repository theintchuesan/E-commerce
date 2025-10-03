const mongoose=require('mongoose');
const bcrypt=require('bcryptjs');
const jwt=require('jsonwebtoken');
const validator=require('validator');

const userSchema=new mongoose.Schema({
    name:{
        type:String,
        required:[true,"Please enter your name"],
        maxLength:[30,"Your name cannot exceed 30 characters"],
        minLength:[4,"Your name must be at least 4 characters"],
    },
    email:{
        type:String,
        required:[true,"Please enter your email"],
        unique:true,
        validate:[validator.isEmail,"Please enter a valid email"],
    },
    password:{
        type:String,    
        required:[true,"Please enter your password"],
        minLength:[8,"Your password must be at least 8 characters"],
        select:false, //password will not be shown when we fetch user details
    },
    avatar:{
        public_id:{
            type:String,
            required:true,
        },
        url:{   
            type:String,
            required:true,
        },
    },
    role:{
        type:String,
        default:"user",
    },
    createdAt:{
        type:Date,
        default:Date.now,
    },
    resetPasswordToken:String,
    resetPasswordExpire:Date,
});

userSchema.pre("save",async function(next){
    if(!this.isModified("password")){ //if password is not modified, then
        next();
    }
    this.password=await bcrypt.hash(this.password,10);
});

//JWT TOKEN
userSchema.methods.getJWTToken=function(){
    return jwt.sign({id:this._id},process.env.JWT_SECRET,{
        expiresIn:process.env.JWT_EXPIRE,
    });
};

//Compare user password
userSchema.methods.comparePassword=async function(enteredPassword){
    return await bcrypt.compare(enteredPassword,this.password);
};

module.exports=mongoose.model("User",userSchema);