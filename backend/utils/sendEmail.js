const nodeMailer=require("nodemailer");
const catchAsyncErrors=require("../middleware/catchAsyncErrors");
const dotenv=require("dotenv");
dotenv.config({path:"backend/config/.env"});

const sendEmail=catchAsyncErrors(async(options)=>{

    const transporter=nodeMailer.createTransport({
        
        service:process.env.SMPT_SERVICE,
        auth:{
            user:process.env.SMPT_MAIL,
            pass:process.env.SMPT_PASSWORD,
        },
    });

    const mailOptions={
        from:process.env.SMPT_MAIL,
        to:options.email,
        subject:options.subject,
        text:options.message,
    };
    await transporter.sendMail(mailOptions);
});

module.exports=sendEmail;