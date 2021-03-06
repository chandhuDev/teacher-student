const express=require("express")
const cookieSession=require("cookie-session")
require("dotenv").config()
require("./databaseConnect").connect()
const passportConfig=require("./passport/passport")
const passport=require("passport")
const cloudinary=require("cloudinary")
const fileUpload=require("express-fileupload")
const User=require("./userschema")
var _=require("lodash")
const app=express()

// cloudinary login
cloudinary.config({ 
    cloud_name: process.env.CLOUD_NAME, 
    api_key: process.env.API_KEY, 
    api_secret: process.env.API_SECRET 
})

//middlewares
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(fileUpload({
    useTempFiles:true,
    tempFileDir:"/temp/"
}))


//cookie
app.use(
    cookieSession({
      maxAge: 2 * 24 * 60 * 60 * 1000,
      keys: ["thisischandhu"], // dotenv
    })
  );

//checking for authorisation
const isLoggedIn = (req, res, next) => {
        if (!req.user) {
          res.redirect("/");
        }
     next();
}

app.use(passport.initialize());
app.use(passport.session());
app.set("view engine", "ejs");
app.set("views","views")

//main route
app.get("/",(req,res,next)=>{
    res.render("main")
})

//logout route
app.get("/logout",(req,res)=>{
    req.logOut()
    res.redirect("/")
})

//registering the user details route
app.post("/credintials",async (req,res,next)=>{
    try{
    const {email,role}=req.body
    const user=await User.findOne({email})
    role=='on'? user.role="student" : user.role="teacher"
    await user.save({validateBeforeSave:false})
    user.role=="teacher" ? res.render("teacherDashboard") : res.redirect("/dashboard")
    }
   catch(e){
    next(new Error("error in passing signup"))
   }
})

//route for displaying the files in the database
app.get("/dashboard",isLoggedIn,async (req,res,next)=>{
    const listNames=[]
    const listUrl=[]
    const fileList=await User.findOne({role:"teacher"})
    _.find(fileList.filePath,(file)=>{
         listUrl.push(file.url)
         listNames.push(file.name)
    })
    res.render("studentDashboard",{
        arrayOfNames:listNames,
        length:listNames.length,
        arrayOfFiles:listUrl
    },(err,result)=>{
        if(err) {
          next(new Error(err))
        }
        res.send(result)
    })
})

//route for uploading the files for teacher
app.get("/upLoadFiles",isLoggedIn,(req,res,next)=>{
    if(req.user){
        if(req.user.role==="teacher") return res.render("teacherDashboard")
        res.redirect("/")
    }
    return res.redirect("/")
})

//route for teacher sending the files to the database
const list1=[]
app.post("/teacherDashboard",isLoggedIn,async (req,res,next)=>{
   try{
    for(let index=0;index < req.files.teacherFile.length; index++){
         const result=await cloudinary.v2.uploader.upload(req.files.teacherFile[index].tempFilePath,
            {
                folder:"teacher-student-Dashboard",
                resource_type: "auto",
                use_filename: true, 
                unique_filename: false
            })
            list1.push({ public_id:result.public_id,url:result.url,name:req.files.teacherFile[index].name })
        }
    const user=await User.findOne({role:"teacher"})
    user.filePath=list1
    await user.save()
    res.redirect("/")
    }
    catch(e){
        console.log(e.message)
        next(new Error("error in teacherDashboard"))
      }
})
  

//route for authentication of google
app.get("/oAuth",passport.authenticate("google", {
      scope: ["profile","email"],
       }),
       (req, res) => {
      res.redirect("/")
    })

//route for callback after authentication of google
app.get("/register",passport.authenticate("google"),(req,res)=>{
    if(req.user.role) return res.redirect("/")
    res.render("register",{
        email:req.user.email
    })
})


//server listenoing at 5000 port
app.listen(process.env.PORT,(req,res)=>{
    console.log('successfully listening')
})