const mongoose=require("mongoose")
exports.connect=async ()=>{
try{
    await mongoose.connect(process.env.DB_URL1,{
        useNewUrlParser:true,
        useUnifiedTopology: true,
    });

}
catch(e){
    new Error("error in connection of database")
}
}