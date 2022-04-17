const mongoose = require('mongoose');
const crypto = require('crypto');

const productSchema = new mongoose.Schema({
    uuid: {type: String, required:false},
    productName:{type: String, required: true, trim: true},
    brand:{type: String, required: true, trim: true},
    quality:{type: String, required: true, trim: true},
    size:{type: String, required: true, trim: true},
    weight: {type: String, required: true, trim: true},
    willow: {type: String, required: true, trim: true},
    price:{type: Number, required: true, trim: true},
    productImage: {type: String, required: true},
    active: {type: Boolean, required: false, default: true},
    userUuid: {type: String, required: true},
    categoryUuid:{type: String, required: true}
},
{
    timestamps: true
});

// UUID generation
productSchema.pre('save', function(next){
    this.uuid = 'PROD-'+crypto.pseudoRandomBytes(6).toString('hex').toUpperCase()
    console.log(this.uuid);
    next();
});

module.exports=mongoose.model('product',productSchema);
