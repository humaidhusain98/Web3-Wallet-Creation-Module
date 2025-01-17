require('dotenv').config();
const mongoose = require("mongoose");
const cors = require("cors");
const express = require('express')
const userRoute = require('./route/userRoute');
const app = express()


const connectMongoDB = ({
    dbName,
    dbConnectionString,
    dbDescription
})=>{
    try {
        const db = mongoose.createConnection(dbConnectionString);
        db.once('open', () => {
          console.log(` Connected to DB: ${dbName}`);
          console.log(` DB Description : ${dbDescription}`)
        })
      
      }
      catch (e) {
        console.log("DB Connection error " + e);
      }
      
} 
// midlewares application
// cors to allow only whitelisted urls to pass through
app.use(cors({
    origin:[
        process.env.ORIGIN
    ]
}));
connectMongoDB({
    dbName:"Web3 Wallet for User Generation DB",
    dbConnectionString: process.env.MONGODB_URL_DB,
    dbDescription:`This DB contains data of user along with their encrypted private keys`,
})

app.use("/v1/loginModule",userRoute);
app.listen(process.env.port, () => {
    console.log(` server running on ${process.env.port}`)

})
