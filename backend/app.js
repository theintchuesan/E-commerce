const express=require('express');
require('dotenv').config();
const app=express();
const errorMiddleware=require('./middleware/error');

 app.use(express.json());

//importing routes
const product=require('./routes/productRoute');

app.use('/api/v1',product);
app.use(errorMiddleware);

module.exports=app;