const User = require('../../models/userModel');
const Wallet = require('../../models/wallet')

const LoadWallet = async (req,res)=>{
    try {
        const userEmail = req.session.user?.email;
        if(!userEmail){
           return res.redirect('/login')
        }
        
        const user = await User.findOne({email:userEmail})
        let wallet = await Wallet.findOne({userId:user._id}).sort({createdAt:-1})
        
        // Create wallet if it doesn't exist
        if (!wallet) {
            wallet = new Wallet({
                userId: user._id,
                balance: 0,
                transaction: []
            });
            await wallet.save();
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