const mongoose = require('mongoose');
const crypto = require('crypto');

const orderSchema = new mongoose.Schema({
    uuid: {type: String, required:false},
    enterProductName:{type: String, required: true, trim: true},
    selectBrand:{type: String, required: true, trim: true},
    selectSize:{type: String, required: true, trim: true},
    enterAddress:{type: String, required: true, trim: true},
    paymentMethod:{type: String, enum:['cashAndDelivery', 'cards'], required: false, default: 'cards'},
    confirmOrder:{type: String, required:true},
},
{
    timestamps: true
});
// UUID generation
orderSchema.pre('save', function(next){
    this.uuid = 'ord-'+crypto.pseudoRandomBytes(6).toString('hex').toUpperCase()
    console.log(this.uuid);
    next();
});

module.exports=mongoose.model('order',orderSchema);
