const mongoose=require("mongoose")
const userSchema=new mongoose.Schema({
    email:{
        type:String,
        required:true,
        unique:true
    },
    role:{
        type:String,
        
        enum:["teacher","student"]
    },
    
    filePath:[{
        public_id:{
            type:String
        },
        url:{
            type:String
        },
        name:{
            type:String
        }
    }],
})


userSchema.methods.getToken=function(){
    return jwt.sign({id:this._id},"chandra@123",{expiresIn:'3h'})
}


module.exports=mongoose.model("User",userSchema)