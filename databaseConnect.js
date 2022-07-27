const mongoose=require("mongoose")
exports.connect=async ()=>{
try{
    await mongoose.connect("mongodb+srv://chandhu:urR0gwxGiqlDCtqc@cluster0.rj8ix.mongodb.net/?retryWrites=true&w=majority",{
        useNewUrlParser:true,
        useUnifiedTopology: true,
    });

}
catch(e){
    new Error("error in connection of database")
}
}