const crypto = require("crypto");
const {Wallet} = require('ethers');
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const createPrivateKey = async ()=>{
    try{
        const privateKey = crypto.randomBytes(32).toString("hex");
        const wallet = new Wallet(privateKey);
        return [privateKey,wallet.address];
    }
    catch(e){
        console.log("Error creating private key :"+e)
        return null;
    }
}

const getAddress = async (pvtKey)=>{
    try{
        const wallet = new Wallet(pvtKey);
        return wallet.address;
    }
    catch(e){
        console.log("Error getting address from private key :"+e)
        return null;
    }
}


const hashCompare = async (data,hash) =>{
    try{
        return await bcrypt.compare(data, hash);
    }
    catch(e){
        console.log("Error while comparing password "+e);
    }
}

const getDecryptedPrivateKey = async (encryptedData, key, initVector) =>{
    try{
        const algorithm = "aes-256-cbc";
        const IV = Buffer.from(initVector, "hex");
        const adjustedKey = Buffer.alloc(32);
        adjustedKey.write(key);
        const decipher = crypto.createDecipheriv(algorithm, adjustedKey, IV);
        let decryptedData = decipher.update(encryptedData, "hex", "utf-8");
        decryptedData += decipher.final("utf-8");
        console.log("Decrypted Private Key "+ decryptedData );
        return decryptedData;
    }
    catch(e){
        console.log("Error while comparing password "+e);
        return null;
    }
}

const generateToken = async(payload)=>{
  try{
    const token = jwt.sign(payload,process.env.JWT_SECRET_KEY,{expiresIn: '2D'})
    return token
  }
  catch(e){
    console.log("Error while generating token "+e);
    return null;
  }
}

const generateIdToken = async (cfa,address,username) =>{
      if (!cfa || !address) {
        console.log("CFA and Address is required")
        return response;
      }
    
      try {
        let jwtSecretKey = process.env.JWT_SECRET_KEY;
        const data = {
          cfa: cfa,
          publicAddress: address,
          username: username
        };
        const token = jwt.sign(data, jwtSecretKey, { expiresIn: "6d" });
        console.log(token);
        return token;
      } catch (error) {
        return null;
      }
}

const generateIdTokenTelegram = async (cfa,telegramId) =>{
  if (!cfa || !telegramId) {
    console.log("CFA and telegramId is required")
    return response;
  }

  try {
    let jwtSecretKey = process.env.JWT_SECRET_KEY;
    const data = {
      cfa: cfa,
      telegramId: telegramId
    };
    const token = jwt.sign(data, jwtSecretKey, { expiresIn: "6d" });
    console.log(token);
    return token;
  } catch (error) {
    return null;
  }
}

const generateJWT = async(data)=>{
  try {
    let jwtSecretKey = process.env.JWT_SECRET_KEY;
    const token = jwt.sign(data, jwtSecretKey, { expiresIn: "6d" });
    console.log(token);
    return token;
  } catch (error) {
    console.log("Error while generating token "+error);
  }
}


const encryptPrivateKey = (message, key) => {
  const algorithm = "aes-256-cbc";
  const initVector = crypto.randomBytes(16);
  const adjustedKey = Buffer.alloc(32);
  adjustedKey.write(key);
  const cipher = crypto.createCipheriv(algorithm, adjustedKey, initVector);
  let encryptedPrivateKey = cipher.update(message, "utf-8", "hex");
  encryptedPrivateKey += cipher.final("hex");
  return {
    encryptedPrivateKey,
    initVector: initVector.toString("hex"),
  };
};

const hashAndEncryptPrivateKey = async ({ pKey, password }) => {
  const hashedPassword = await bcrypt.hash(password, 10);
  const { encryptedPrivateKey, initVector } = encryptPrivateKey(pKey, password);

  return {
    hashedPassword,
    encryptedPrivateKey,
    initVector,
  };
};

module.exports = {hashCompare,getDecryptedPrivateKey,generateIdToken,hashAndEncryptPrivateKey,generateIdTokenTelegram,generateJWT,getAddress,createPrivateKey,generateToken};
