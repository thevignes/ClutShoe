const app = require("../../app")
const User = require ('../../models/userModel')



const HomePage = async (req,res)=>{
    try{
        // console.log('rendering')
        return res.render('home')
        
    }catch(error){
        console.error(error)
        return res.status(500).send('Server Error')
    }
}
const PageNotFound = async (req,res)=>{
    try{
        return res.render('PageNotfound')
    }catch(error){
        res.redirect('PageNotfound')
    }
}

const  homePage = async (req,res)=>{
    try{

        res.render('/')
    }catch(error){

        console.error(error)
        res.status(500).send('Server Error')
    }
}
const SignUp = async (req,res)=>{
    try{
        return res.render('register')
    }catch(error){
        console.log(error)
        return res.status(500).json({message:'server error'})
    }
}

const Registration = async (req, res) => {
    try {
        const { name, password, email } = req.body;
        console.log(req.body);

        // if (!name || !password || !email) {
        //     return res.status(400).json({ success: false, message: 'All fields are required' });
        // }
    
        // const existingUser = await User.findOne({ email });
        // if (existingUser) {
        //     return res.status(400).json({
        //         success: false,
        //         message: 'User already exists',
        //     });
        // }
        // const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            name: name,
            email: email,
            password: password,
         
            
        });

        await newUser.save();

        console.log( newUser); 
       res.render('register',);

    } catch (error) {
        console.error('Error during registration:', error); 
        res.status(500).json({ success: false, message: 'Failed to register to our website' });
    }
}

module.exports ={
    HomePage,
    PageNotFound,
    homePage,
    SignUp,
    Registration
}