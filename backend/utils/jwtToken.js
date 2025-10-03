const sendToken=(user,statusCode,res)=>{
    const jwtToken=user.getJWTToken();
    //options for cookie    
    const options={
        expires:new Date(
            Date.now()+process.env.COOKIE_EXPIRE*24*60*60*1000
        ),
        httpOnly:true,
    };
    res.status(statusCode).cookie('token',jwtToken,options).json({
        success:true,
        user,
        token:jwtToken,
    });
}
module.exports=sendToken;
