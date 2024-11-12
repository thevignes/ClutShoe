const User = require('../../models/userModel');
const Wallet = require('../../models/wallet')

const LoadWallet = async (req,res)=>{
    try {
        const userEmail = req.session.user?.email;
        const user = await User.findOne({email:userEmail})
        const wallet = await Wallet.findOne({userId:user._id});

        if(!userEmail){
           return res.redirect('/login')
        }

        res.render('wallet', {wallet, user})

    } catch (error) {
        console.log(error, 'cant get this page')

        return res.status(500).send('server error!')
    }
}


module.exports = {
    LoadWallet
}