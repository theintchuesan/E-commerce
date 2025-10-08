const catchAsyncErrors = require('../middleware/catchAsyncErrors');
const Product=require('../models/productModel');
const ApiFeatures = require('../utils/ApiFeatures');
const ErrorHandler = require('../utils/errorHandler');

exports.createProduct=catchAsyncErrors (async(req,res,next)=>{
    req.body.user=req.user.id;
    const product=await Product.create(req.body);
    res.status(201).json({  
        success:true,
        product,
    });
});

//Get all products
exports.getAllProducts =catchAsyncErrors(async(req,res)=>{
    const resultsPerPage=5;
    const apiFeatures= new ApiFeatures(Product.find(),req.query).search().filter().pagination(resultsPerPage);
    const products=await apiFeatures.query;
    res.status(200).json({
        success:true,
        count: products.length,
        products,
    })
});

//Upadte the product -- Admin
exports.updateProduct=catchAsyncErrors(async(req,res,next)=>{
    let product=await Product.findById(req.params.id);
    if(!product){
        return next(new ErrorHandler("Product not found",404));
        }
      
    product=await Product.findByIdAndUpdate(req.params.id,req.body,{
        new:true,
        runValidators:true,
        useFindAndModify:false,
    });
    res.status(200).json({  
        success:true,
        product,
    });
});

//Get single product details
exports.getProductDetails=catchAsyncErrors(async(req,res,next)=>{
    const product=await Product.findById(req.params.id);
     if(!product){
        return next(new ErrorHandler("Product not found",404));
        };
    res.status(200).json({
        success:true,
        product,
    });
});

//Delete the product -- Admin
exports.deleteProduct=catchAsyncErrors(async(req,res,next)=>{
    const product=await Product.findById(req.params.id);
     if(!product){
        return next(new ErrorHandler("Product not found",404));
        };  
    await product.deleteOne();
    res.status(200).json({  
        success:true,
        message:"Product deleted successfully",
    });
});
