const {totp} = require('otplib');

function otp(type){
    if( type == 'send'){
        const secretkey="secrectKey_raj";
    const token = totp.generate(secretkey)
    console.log(token)
    return token
    }
    
}
otp();

function verify(){
    const secretkey="secrectKey_raj";
    const token = totp.generate(secretkey)
    console.log(token);
    const checking= totp.check(token,secretkey)
    console.log(checking)
}
verify();

  module.exports = {otp , verify}
