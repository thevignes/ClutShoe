const User = require ("../models/userModel");
const Admin = require ("../models/adminModel")


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




// // Middleware to check if the user is an admin
// const AdminAuth = async (req, res, next) => {
//     if (req.session.user) {
//         try {
//             // Check if the user exists in the admin collection
//             const adminUser = await Admin.findById(req.session.user);
//             if (adminUser) { // If the user is found in the admin collection
//                 req.user = adminUser; // Attach admin user data to request
//                 next(); // Proceed to the next middleware or route handler
//             } else {
//                 req.flash('error', 'Access denied: You are not an admin');
//                 res.redirect('/login'); // Redirect to the login page
//             }
//         } catch (error) {
//             console.error(error);
//             req.flash('error', 'An error occurred while checking admin authentication.');
//             res.redirect('/admin/signin'); // Redirect to the login page on error
//         }
//     } else {
//         req.flash("error", "You're not logged in");
//         res.redirect('/admin/signin');
//     }
// };


module.exports = {
    UserAuth,
   
}