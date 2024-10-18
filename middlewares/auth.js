const User = require ("../models/userModel");



// Middleware to check if user is logged in

const UserAuth = async (req,res)=>{
if(req.session.user){
    User.findById(req.session.user).then(data =>{
        if(data && !data.IsBlocked){
            req.user = data;
            next();
        }else{
            req.flash('error','You are blocked by admin')
            res.redirect('/login')
        }
    }).catch(error)
        console.log(error)
    
}else{
    res.redirect('/login')
    req.flash("error","your not logged in")
}

}





module.exports = UserAuth;