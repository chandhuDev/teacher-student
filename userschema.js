const mongoose=require("mongoose")
const userSchema=new mongoose.Schema({
    email:{
        type:String,
        required:true,
        unique:true
    },
    role:{
        type:String,
        default:"teacher",
        enum:["teacher","student"]
    },
    password:{
        type:String
    },
    filePath:[{
        path:{
            type:String
        },
        fullName:{
            type:String
        }
    }]

})


module.exports=mongoose.model("User",userSchema)