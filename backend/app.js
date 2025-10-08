const express=require('express');
require('dotenv').config();
const app=express();
const errorMiddleware=require('./middleware/error');
const cookieParser = require('cookie-parser');

app.use(cookieParser());
app.use(express.json());
 

//importing routes
const product=require('./routes/productRoute');
const user=require('./routes/userRoute');

app.use('/api/v1',product);
app.use('/api/v1',user);
app.use(errorMiddleware);

module.exports=app;