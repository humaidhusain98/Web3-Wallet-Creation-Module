const express = require('express');
const UserModel = require('../model/userModelSchema');
const Response = require('../class/response');
const { createPrivateKey, hashAndEncryptPrivateKey, getAddress, generateIdToken, generateToken, hashCompare } = require('../web3/walletUtils');
const router = express.Router();

router.post('/checkUsernameAnon',async(req,res)=>{
    try{
        const {username} = req.body;
        if(!username || username.length<5){
            res.status(400).json(new Response(400,"username required in body and length more than 4","",{}));
        }
        else{
            const check =await UserModel.findOne({
                source: 'anonymous',
                username: username
            },{_id:1});
            console.log(check);
            if(check){
                res.status(200).json(new Response(200,"Successfully Fetched","",{isAvailable: false}))
            }
            else{
                res.status(200).json(new Response(200,"Successfully Fetched","",{isAvailable: true}))
            }
        }
        
    }
    catch(e){
        console.log("Error occured checking username");
        res.status(500).json(new Response(500,"","Error :"+e,{}));
    }
})


router.post('/registerAnonymous',async(req,res)=>{
    try{
        const {username,name,password} = req.body;
        if(!username || !password || !name){
            res.status(400).json(new Response(400,"username,name and password required in body","",{}));
        }else{
            const check = await UserModel.findOne({
                source: 'anonymous',
                username: username
            },{_id:1});
            if(check){
                res.status(409).json(new Response(409,"username already taken","",{}));
            }
            else{
                const [pvtKey,address] =await createPrivateKey();
                const { hashedPassword,  encryptedPrivateKey, initVector} = await hashAndEncryptPrivateKey({pKey: pvtKey,password: password});

                const user = new UserModel({
                    username: username,
                    source: 'anonymous',
                    address: address,
                    name: name,
                    password: hashedPassword,
                    privateKey: encryptedPrivateKey,
                    uniqueKey: initVector,
                    image: "https://www.shutterstock.com/image-vector/vector-flat-illustration-grayscale-avatar-600nw-2281862025.jpg",
                });
                console.log(user);
                await user.save();
                const token = await generateToken({username: username});
                let response = new Response(201,"Successfully Registered User","",{"userDetails":{
                    "username": username,
                    "address": address,
                    "name":name,
                    "image":"https://www.shutterstock.com/image-vector/vector-flat-illustration-grayscale-avatar-600nw-2281862025.jpg"
                }, "token": token})
                res.status(201).json(response);
            }
        }
    }   
    catch(e){
        console.log("Error occured registering anonymous user");
        res.status(500).json(new Response(500,"","Error :"+e,{}));
    } 
})

router.post("/anonLogin", async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json(new Response(400, "Username and password required", "Invalid input", {}));
        }

        
        const user = await UserModel.findOne(
            { source: 'anonymous', username: username },
            { username: 1, address: 1, name: 1, email: 1, image: 1, password: 1 }
        );

        if (user) {
           
            const isCorrectPassword = await hashCompare(password, user.password);

            if (isCorrectPassword) {
                const token = await generateToken({ username: username });

                if (!req.session) {
                    req.session = {};  
                }

                req.session.user = {
                    name: user.name,
                    email: user.email,
                    image: user.image,
                    username: user.username,
                };

                return res.status(200).json(new Response(200, "Successfully logged in", "", { user, token }));
            } else {
                return res.status(401).json(new Response(401, "Username and password do not match", "Authentication failed", {}));
            }
        } else {
            return res.status(404).json(new Response(404, "User not found", "No user with that username", {}));
        }
    } catch (e) {
        console.error("Error occurred during anonymous login:", e);
        return res.status(500).json(new Response(500, "Server error", `Error: ${e.message}`, {}));
    }
});




router.post("/signInSocial",async(req,res)=>{
    try{
        const {image,username,source,name} = req.body;
        if(!image || !username || !source || !name){
            res.status(400).json(new Response(400,"required fields not supplied","",{}));
        }
        else{
            const [pvtKey,address] =await createPrivateKey();
            const { hashedPassword,  encryptedPrivateKey, initVector} = await hashAndEncryptPrivateKey({pKey: pvtKey,password: username});
    
            let userObj = await UserModel.findOne({
                source: source,
                username: username
            },{_id:1,username:1,source:1,address:1,name:1,image:1});
            if(userObj){
                const token = await generateToken({username: username});
                res.status(200).json(new Response(200,"Successfully logged In","",{user: userObj,token: token}));
            }
            else{
                const token = await generateToken({username: username});
                userObj = new UserModel({
                    username: username,
                    source: source,
                    address: address,
                    name: name,
                    password: hashedPassword,
                    privateKey: encryptedPrivateKey,
                    uniqueKey: initVector,
                    image: image
                });
                await userObj.save();
                res.status(200).json(new Response(200,"Successfully User Created","",{user: userObj,token: token}));
            }   
        }
      
      
    }
    catch(e){
        console.log("Error occured during social login");
        res.status(500).json(new Response(500,"","Error :"+e,{}));
    }
});






module.exports = router;