const app = require("../../app")


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

module.exports ={
    HomePage,
    PageNotFound,
    homePage
}