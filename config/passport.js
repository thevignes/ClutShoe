
const passport = require('passport')
const GoogleStrategy = require( 'passport-google-oauth2' ).Strategy;
const User  = require("../models/userModel")

require('dotenv').config()

passport.use(new GoogleStrategy({
    clientID:     process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL:  process.env.GOOGLE_CALLBACK_URL,
    passReqToCallback   : true
  },
  async(request, accessToken, refreshToken, profile, done)=> {

    console.log('Google Profile:', profile)
    //getting user data from google 

  
    try {
    let  user = await  User.findOne({googleId: profile.id})
    if(user){
        done(null,user)
    }else{
        const newUser = new User ({
            googleId: profile.id,
            name: profile.displayName,
            email: profile.emails[0].value,
           
        })
       user = await newUser.save();
     done(null,user)
    }
    } catch (error) {
    console.log(error.message)
      
    }
  }

 
));
passport.serializeUser((user,done)=>{
done(null,user.id)
})
passport.deserializeUser((id, done) => {
    User.findById(id)
        .then(user => done(null, user))
        .catch(err => done(err, null));
});



  
module.exports = passport