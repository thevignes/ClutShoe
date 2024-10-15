const app = require("../../app")
const Admin = require('../../models/adminModel')
const bcrypt = require('bcrypt')

const Dashboard =  async (req,res)=>{
    try {
       return  res.render('dashboard')
    } catch (error) {
        console.log(error)
        res.status(500).send('Server Error')
    }
}

const AdminLogin = async (req,res)=>{

    try {
        return res.render('signin')
        
    } catch (error) {
        console.log(error)
        return res.status(400).send({message:"cant get login page server error"})
        
    }
}




module.exports ={
    Dashboard,
    AdminLogin
 
}