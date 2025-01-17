const mongoose = require('mongoose');
const db = mongoose.createConnection(process.env.MONGODB_URL_DB2+"user");
const userSchema = new mongoose.Schema({
    address:{
        type:String,
        unique: true,
        required: true,
    },
    source:{
        type:String,
        unique: false,
        required: true,
    },
    name:{
        type: String,
        unique: false,
        required: true
    },
    username:{
        type: String,
        required:true
    },

    privateKey:{
        type: String,
        required: true
    },
    uniqueKey:{
        type: String,
        required: true
    },
    password:{
        type: String,
        required: true
    },
    image:{
        type: String,
        required: true
    }
    
},
{
    timestamps: true
}
)
const UserModel = db.model('user', userSchema);
module.exports = UserModel 