const passport=require("passport")
const User=require('../userschema')
var GoogleStrategy = require('passport-google-oauth20').Strategy;


passport.serializeUser(function (user, done) {
    done(null, user.id);
  });
  
passport.deserializeUser(function (id, done) {
    User.findById(id, function (err, user) {
      done(err, user);
    });
  });


const PORT=process.env.PORT || 5000

passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: `${process.env.HOST}:${PORT}/register`
  },
  function(accessToken, refreshToken, profile, next) {
    
    // console.log(profile.id,profile._json.email)
    User.findOne({email:profile._json.email}).then(user=>{
        if(user){
          
            next(null,user)
        }
        else{
            User.create({email:profile._json.email}).then(async (user)=>{
                
                next(null,user)
            }).catch((e)=>{
                console.log(e)
                
            })
        }
    })
    

  }
))