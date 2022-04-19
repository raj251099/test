const joi=require('joi')
const {schema} = require('/category.models')

const prodSchema=joi.object({
        productName: joi.string().alphanum().required(),
        brand: joi.number().integer().required(),
        quality:joi.string().alphanum().required(),
        size:joi.string().alphanum().required(),
        weight:joi.number().integer().required(),
        willow:joi.string().required(),
        price:joi.string().required(),
        productImage:joi.string().required(), 
        userUuid:joi.string().required(), 
        categoryUuid:joi.string().required(),        
})
module.exports={
    prodSchema:prodSchema
}
