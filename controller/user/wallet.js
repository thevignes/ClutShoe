const User = require('../../models/userModel');
const Wallet = require('../../models/wallet')

const LoadWallet = async (req,res)=>{
    try {
        // const currentPage = parseInt(req.query.page)||2;
        // const itemsPerPage = 5;
        const userEmail = req.session.user?.email;
        const user = await User.findOne({email:userEmail})
        // const totalAmount = await Wallet.countDocuments({userId:user._id})

            // const totalPages = Math.ceil(totalAmount/itemsPerPage)
            // const skip = (currentPage-1)*itemsPerPage
        const wallet = await Wallet.findOne({userId:user._id}).sort({createdAt:-1})

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