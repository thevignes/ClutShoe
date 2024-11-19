const User = require('../../models/userModel');

const ContactPage = async(req,res)=>{
    try {
        const user = await User.find()
        res.render('contact', {user})
    } catch (error) {
        console.log(error)
    }
}

const about = async(req,res)=>{
    try {
        const user = await User.find()
        res.render('about', {user})
    } catch (error) {
        console.log(error)
    }
}

module.exports = {
    ContactPage,
    about
}