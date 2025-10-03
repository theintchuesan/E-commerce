class ApiFeatures{
    constructor(query,queryStr){
        this.query=query;
        this.queryStr=queryStr;
    }
    search(){
        const keyword=this.queryStr.keyword ? {
            name:{
                $regex:this.queryStr.keyword, //allowed to search by keyword even partial and flexible match
                $options:'i',
            },
        }:{};
        console.log(keyword);
        this.query=this.query.find({...keyword});
        return this;
    }
    filter(){
        const queryCopy={...this.queryStr};

        //Removing some fields for category
        const removeFields=["keyword","page","limit"];
        removeFields.forEach((key)=>delete queryCopy[key]);

        console.log(queryCopy);

        //Filter for price and rating
        let queryStr=JSON.stringify(queryCopy);
        queryStr=queryStr.replace(/\b(gt|gte|lt|lte)\b/g,key=>`$${key}`); //regular expression to add $ before gt,gte,lt,lte

        this.query=this.query.find(JSON.parse(queryStr));
        console.log(queryStr);
        return this;
    }
    pagination(resultsPerPage){ //example 5 products per page
        const currentPage=Number(this.queryStr.page) || 1;
        const skip=resultsPerPage*(currentPage-1);
        this.query=this.query.limit(resultsPerPage).skip(skip);
        return this;
    }
}

module.exports=ApiFeatures;