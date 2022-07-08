const express=require("express")
const cookie=require("cookie-session")
require("dotenv").config()
require("./databaseConnect").connect()
const passportConfig=require("./passport/passport")
const passport=require("passport")
const User=require("./userschema")
const multer=require("multer")
var _=require("lodash")
const app=express()
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(
    cookie({
      maxAge: '3h',
      keys: ["chandhu"], // dotenv
    }))
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
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './uploads/')
    },
    filename: function (req, file, cb) {
      const filename = file.originalname
      cb(null, file.fieldname + '-' + filename)
    }
  })
const upload = multer({ storage: storage })
app.get("/",(req,res,next)=>{
    res.render("main")
})
app.get("/logout",(req,res)=>{
    req.logOut()
    res.redirect("/")
})
app.get("/login",(req,res,next)=>{
  res.render("login")
})
app.post("/authenticate",async (req,res,next)=>{
    try{
        const {email,password}=req.body

    if(!email || !password || email==="" || password==="") return next(new Error("error in authenticate"))
    
     const user=await User.find({email})
     if(!user || !user.password===password ) return next(new Error(" do first signup"))
     
     user.role==="student" ? res.render("studentDashboard") : res.render("teacherDashboard",{
        arrayOfNames:listOfFiles,
        length:listOfFiles.length
     })
    }
    catch(e){
        console.log(e)
        next(new Error("error in authenticate"))
    }
})
app.post("/credintials",async (req,res,next)=>{
    try{
    const {email,password,role}=req.body
    const user=await User.findOne({email})
    user.password=password
    if(role) user.role="student"
    await user.save({validateBeforeSave:false})
    user.role==="teacher" ? res.render("teacherDashboard") : res.render("studentDashboard")
    }
   catch(e){
    console.log(e)
    next(new Error("error in passing signup"))
   }})

app.get("/dashboard",isLoggedIn,async (req,res,next)=>{
    const listOfFiles=[]
    const fileList=await User.find({role:"teacher"})
    console.log(fileList)
    _.find(fileList.filePath,(file)=>{
         listOfFiles.push(file.path[0].split("\\")[1].split(".")[0])
    })
    res.render("studentDashboard",{
        arrayOfNames:listOfFiles,
        length:listOfFiles.length
    })
})
app.get("/upLoadFiles",isLoggedIn,(req,res,next)=>{
   if(req.user.role==="teacher") return res.render("teacherDashboard")
})
app.post("/teacherDashboard",isLoggedIn,upload.array('teacherFile',5),async (req,res,next)=>{
   try{
    const listOfFiles=[]
    _.find(req.files,(file)=>{
        const filePath={
           path:file.path,
           fullName:file.originalname
        }
        listOfFiles.push(filePath)
    })
    console.log(listOfFiles)
    const user=await User.findOne({role:"teacher"})
    user.filePath=listOfFiles
    await user.save()
    res.redirect("/")
  }
  catch(e){
    console.log(e)
    next(new Error("error in teacherDashboard"))
  }
})
app.get("/oAuth",passport.authenticate("google", {
      scope: ["profile","email"],
       }),
       (req, res) => {
      res.redirect("/")
    })
app.get("/register",passport.authenticate("google"),(req,res)=>{
    res.render("register",{
        email:req.user.email
    })
})
app.listen(5000,(req,res)=>{
    console.log('successfully listening')
})