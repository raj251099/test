const router = require('express').Router();
const productSchema = require("../mymodels/my.models");
const req = require('express/lib/request');
const userSchema = require("../mymodels/user.models");
const categorySchema = require("../mymodels/category.models")
const {authVerify, isAdmin} = require("../midleware/auth");
const orderSchema = require('../mymodels/order.model');
const moment = require('moment');
// add product api for admin
router.post('/addProduct', async(req,res)=>{
    try{
        let detail = req.body
        const data = new productSchema(detail);
        const result = await data.save();
        return res.status(200).json({'status': 'success', "message": "Product details added successfully", "result": result})
    }catch(error){
        console.log(error.message);
        return res.status(400).json({"status": 'failure', 'message': error.message})
    }
});

// get all product api for user
router.get("/getAllProducts",authVerify, async(req,res)=>{
    try{
        const productDetails = await productSchema.find().exec();
        if(productDetails.length > 0){
            return res.status(200).json({'status': 'success', message: "Product details fetched successfully", 'result': productDetails});
        }else{
            return res.status(404).json({'status': 'failure', message: "No Product details available"})
        }
    }catch(error){
        console.log(error.message);
        return res.status(400).json({"status": 'failure', 'message': error.message})
    }
});

// get individual product details
router.get("/getIndiProd",authVerify, async(req,res)=>{
    try {
        const productDetails = await productSchema.findOne({"uuid" : req.query.product_uuid}).exec();
        if(productDetails){
            return res.status(200).json({'status': 'success', message: "Product details fetched successfully", 'result': productDetails});
        }else{
            return res.status(404).json({'status': 'failure', message: "No Product details available"})
        }
    } catch (error) {
        console.log(error.message);
        return res.status(400).json({"status": 'failure', 'message': error.message})
    }
});

// update the product details api call
router.put("/updateTheProduct",authVerify, async(req,res)=>{
    try {
        let condition = {"uuid": req.body.uuid}
        let updateData = req.body.updateData;
        let option = {new: true}
        const data = await productSchema.findOneAndUpdate(condition, updateData, option).exec();
        return res.status(200).json({'status': 'success', message: "Product details updated successfully", 'result': data});
    } catch (error) {
        console.log(error.message);
        return res.status(400).json({"status": 'failure', 'message': error.message})
    }
});

// delete product details api call
router.delete("/deleteTheProductDetail/:product_uuid",authVerify, async(req,res)=>{
    try {
        console.log(req.params.product_uuid)
        await productSchema.findOneAndDelete({uuid: req.params.product_uuid}).exec();
        return res.status(200).json({'status': 'success', message: "Product details deleted successfully"});
    } catch (error) {
        console.log(error.message);
        return res.status(400).json({"status": 'failure', 'message': error.message})
    }
});

//get all product api for based on the user
router.get("/getAllProductsBasedOnUser/:userUuid", authVerify, async(req,res)=>{
    try{
        const productDetails = await productSchema.find({userUuid: req.params.userUuid}).exec();

        // aggregate[]
        if(productDetails.length > 0){
            return res.status(200).json({'status': 'success', message: "Product details fetched successfully", 'result': productDetails});
        }else{
            return res.status(404).json({'status': 'failure', message: "No Product details available"})
        }
    }catch(error){
        console.log(error.message);
        return res.status(400).json({"status": 'failure', 'message': error.message})
    }
});

// aggregate based
router.get("/userBasedProduct", async(req,res)=>{
    try {
        let productDetails = await categorySchema.aggregate([
            {
                '$lookup':{
                    from:'products',
                    localField: 'uuid',
                    foreignField: 'categoryUuid',
                    as: 'product_details'
                }
            },
            {
                $match:{
                $and:[
                    {"uuid": req.query.category_uuid},
                    {"userUuid":req.query.userUuid},
                    {"ageRestriction":{$in:[req.query.ageRestriction]}}
                ]
                }  
            },
            {
                "$lookup":{
                    from:'user',
                    localField:'userUuid',
                    foreignField:'uuid',
                    as:'user_data'
                }
            }, 
            {
              "$unwind":{
                  path:'$product_details',
                  preserveNullAndEmptyArrays:true
              }  
            },
            {
                '$unwind':{
                    path: '$user_data',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $project: {
                    "_id": 1,
                    "categoryName": 1,
                    "product_details.productName": 1,
                    "product_details.brand":1,
                    "product_details.size":1,
                    "user_data.username":1

                }
            }         

        ])

        
        if(productDetails.length > 0){
            return res.status(200).json({'status': 'success', message: "Product details fetched successfully", 'result': productDetails});
        }else{
            return res.status(404).json({'status': 'failure', message: "No Product details available"})
        }
    } catch (error) {
        console.log(error.message);
        return res.status(400).json({"status": 'failure', 'message': error.message})
    }
});

// router.get("/getProduct", async(req,res)=>{
//     try {
//         let productDetails = await userSchema.aggregate([
//             {
//                 '$lookup':{
//                     from:'category',
//                     localField: 'uuid',
//                     foreignField: 'userUuid',
//                     as: 'product_details'
//                 }
//             },
//             {
//                 $match:{
//                 $and:[
//                     {"username": req.query.username},
//                     {"userUuid":req.query.userUuid},
//                 ]
//                 }  
//             },
//         ])
    
//     if(productDetails.length > 0){
//         return res.status(200).json({'status': 'success', message: "Product details fetched successfully", 'result': productDetails});
//     }else{
//         return res.status(404).json({'status': 'failure', message: "No Product details available"})
//     }
// } catch (error) {
//     console.log(error.message);
//     return res.status(400).json({"status": 'failure', 'message': error.message})
// }
// });



router.post('/addCategory', async(req,res)=>{
    try{
        const data = new categorySchema(req.body);
        const result = await data.save()
        return res.status(200).json({status: "success", message: 'category added successfully', result: result})
    }catch(error){
        console.log(error.message);
        return res.status(400).json({"status": 'failure', 'message': error.message})
    }
});
//order api for product
router.post('/orderProduct', async(req,res)=>{
    try{
        let detail = req.body
        const data = new orderSchema(detail);
        const result = await data.save();
        console.log("your order will arrive within three days");
        return res.status(200).json({'status': 'success', "message": " successfully your order has been placed "})
    }catch(error){
        console.log(error.message);
        return res.status(400).json({"status": 'failure', 'message': error.message})
    }
    
});

//date bassed get product details
router.get('/dateBassedProduct',async(req,res)=>{
    try{
    let startDate = req.query.startDate
    let endDate = req.query.endDate
    let date1 = moment(startDate).format('YYYY-MM-DDT00:00:00.000Z')
    let date2 = moment(endDate).format('YYYY-MM-DDT23:59:59.000Z')
    const productInfo = await productSchema.aggregate([
        {
            $match:{
                $and:[
                     
                     { createdAt: {
                        $gt: new Date(date1),
                        $lte: new Date(date2),
                     }, 
                     },
                ],
            },
        },
    
        {
            $lookup:{
               from:'users',
               localField:'userUuid',
               foreignField:'uuid',
               as:'user_Datas' 
            },
        },
        {
            $sort:{model:1}
        },
        {
            $project: {
                "_id": 0,
                "uuid":0,
                "categoryUuid":0,
                "userUuid":0,
                "updatedAt":0
            }
        },
       
    ]) 
    if(productInfo){
        return res.json({status:'success',message:"productDetails fetched succussfully",'result':productInfo}); 
    }else{
        return res.json({status:'failure',message:'productDetails is not available'});
    } 
    }catch(err){
        res.json({status:'failure',message:err.message});
    }
     
})





module.exports = router;
