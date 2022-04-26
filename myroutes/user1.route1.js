const router= require('express').Router();
const bcrypt =require('bcrypt');
const jwt = require('jsonwebtoken');
const moment = require('moment');

// imported schema
const userSchema = require('../mymodels/user.models');
const mailSending= require("../midleware/gmail");

router.post('/signUp', async(req,res)=>{
    try {
        const username = req.body.username;
        const email = req.body.email;
        const mobileNumber = req.body.mobileNumber;
        
        if(username){
            let usernameDetail = await userSchema.findOne({'username': username}).exec()
            if(usernameDetail){
                return res.json({status: "failure", message: 'username already exist'})
            }
        }else{
            return res.status(400).json({status: "failure", message: 'Must attach the username'})
        }

        if(mobileNumber){
            let usermobileNumberDetail = await userSchema.findOne({'mobileNumber': mobileNumber}).exec()
            if(usermobileNumberDetail){
                return res.json({status: "failure", message: 'mobileNumber already exist'})
            }
        }else{
            return res.status(400).json({status: "failure", message: 'Must attach the mobileNumber'})
        }

        if(email){
            let useremailDetail = await userSchema.findOne({'email': email}).exec()
            if(useremailDetail){
                return res.json({status: "failure", message: 'email already exist'})
            }
        }else{
            return res.status(400).json({status: "failure", message: 'Must attach the email'})
        }

        let user = new userSchema(req.body);
        console.log("before hashing")
        console.log(user.password);
        if(req.body.password){
            let password = req.body.password;
            let salt = await bcrypt.genSalt(10);
            console.log("_".repeat(2))
            user.password = bcrypt.hashSync(password, salt);
            console.log("after hashing")
            console.log(user.password);
        }
        let result = await user.save();

        return res.status(200).json({status: "success", message: "user details added successfully", data: result})
    } catch (error) {
        console.log(error.message)
        return res.status(500).json({status: "failure", message: error.message})
    }
});
// login
router.post('/login', async(req,res)=>{
    try {
        let username = req.body.username;
        let password = req.body.password;
        let userDetails;
        let userDetails1 = await userSchema.findOne({username: username}).select('-password -_id').exec()
        if(username){
            userDetails = await userSchema.findOne({username: username}).exec()
            if(!userDetails){
                return res.status(400).json({status: "failure", message: "please signup first"});
            }
        }else{
            return res.status(400).json({status: "failure", message: "Please enter the username"})
        }
        if(userDetails){
            let isMatch = await bcrypt.compare(password, userDetails.password)
            if(userDetails.firstLoginStatus !== true){
               await userSchema.findOneAndUpdate({uuid: userDetails.uuid}, {firstLoginStatus: true}, {new:true}).exec();
            }
            let payload = {uuid: userDetails.uuid}
           // let payload = {uuid: userDetails.uuid, role: userDetails.role}
           
            if(isMatch){
                var userData = userDetails1.toObject()
                let jwttoken = jwt.sign(payload, process.env.secrectKey)
                userData.jwttoken = jwttoken
                return res.status(200).json({status: "success", message: "login successfull", data: {userData, jwttoken}})
            }else{
                return res.status(200).json({status: "failure", message: "login failed"})
            }
        }
    } catch (error) {
        console.log(error.message)
        return res.status(500).json({status: "failure", message: error.message})
    }
})

// logout
router.post("/logout/:uuid", async(req,res)=>{
    try {
        let date = moment().toDate();
        console.log(date)
        await userSchema.findOneAndUpdate({uuid: req.params.uuid}, {lastedVisited: date,loginStatus: false}, {new:true}).exec()
        return res.status(200).json({status: "success", message: "logout success"})
    } catch (error) {
        console.log(error.message)
        return res.status(500).json({status: "failure", message: error.message})
    }
})


//api for resetPassword
router.post('/resetPassword', async(req,res)=>{
    try{
       let username = req.body.username;
       let userUpdate = {username:req.body.username}
       let strondpassword = {new:true};
       let resetPassword = req.body.resetPassword;
       let newPassword = resetPassword.password;
       let usersDetails;
      
       if(username){
           userDetails =await userSchema.findOne({username:username}).exec();
           if(userDetails.username!=username){
               console.log("invalid username");
               if(userDetails.username==username){
                  if(username==usename && userDetails.password!=password) {
                     if(resetPassword.password){
                        let password = resetPassword.password;
                         let salt = await bcrypt.genSalt(10);
                         updatePassword.password = bcrypt.hashSync(password, salt);   
                     }
                     const updateData = await userSchema.findOneAndUpdate(userUpdate,resetPassword,strondpassword).exec();
                     return res.status(200).json({status:'success',message:' password updated successfully',result:updateData})  
                  } 
               }
           }else{
               return res.status(400).json({'status':'failure','message':'please enter correct username'})
           }
           
       }
 
    }catch(error){
        console.log(error.message);
        return res.status(500).json({status:'Failure',message:error.message})
    }
});
router.post("/mailSendingApi", async(req, res)=>{
    try {
        const toMail = req.body.toMail;
        const subject = req.body.subject;
        const text = req.body.text;
        const mailData = {
            from: "trainingmern@gmail.com",
            to: toMail,
            subject: subject,
            fileName: 'confirmationemail.ejs',
            attachments:[
                {
                    filename: 'other.doc',
                    filePath:"C:\Users\DELL PC\Pictures\javaScript sc\other.doc"                    
                }
            ],
            details:{
                name: "raj",
                date: new Date(),
                link: "https://www.w3schools.com/html/tryit.asp?filename=tryhtml_default"
            }
        }
        //trainingmern@gmail.com
        await mailSending.mailSending(mailData).then(data=>{
            return res.status(200).json({status: "success", message: "Mail sent successfully"})
        }).catch((error)=>{ 
            return res.status(400).json({status: "failure", message: "Mail sent failed"})
        })   
    } catch (error) {
        console.log(error.message)
        return res.status(500).json({status: "failure", message: error.message})
    }
});



module.exports = router;
