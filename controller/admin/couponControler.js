const Coupon = require('../../models/couponModels');

const couponPage = async (req,res)=>{
    try {
        return res.render('coupon')
        
    } catch (error) {
        console.log(error, ' cannot get this page !');
        return res.status(500).json({ message: 'Internal Server Error' });
        
    }
}
    const addCoupon =  async (req,res)=>{
        console.log('heheheheheheh')
        try {
            console.log('requeseeeeeee')
            const {name, amount,couponCode,description,limit,expiryDate, userLimit, maxDiscount} = req.body;
            console.log(req.body)

            const existingCoupon = await Coupon.findOne({couponCode})

            if(existingCoupon){
                return res.status(400).json({message: 'Coupon already exists!'})
            }

            const coupon = new Coupon ({
                    name,
                    couponCode,
                    amount,
                    description,
                    limit,
                    userLimit,
                    expiryDate,
                    maxDiscount
            });

                    

            await coupon.save();
            console.log('hwlo', coupon)
            return res.status(201).json({message: 'Coupon created successfully!'})
            
        } catch (error) {
            console.log(error, ' cannot add this coupon !');
            return res.status(500).json({ message: 'Internal Server Error' });
            
        }
    }

    const  couponList = async(req,res)=>{
        try {
            const coupons = await Coupon.find()
            res.render('couponList',{coupons})
        } catch (error) {
            console.log(error, 'server error')
            return res.status(500).send('server error oops!')
            
        }
    }
    const DeleteCoupon = async (req, res) => {
        console.log('jjhjhjhjjhjh');
        
        try {
            const couponId = req.params.id;
            console.log(couponId)
            const coupon = await Coupon.findByIdAndDelete(couponId);
    console.log('>>>>>>>>>>>>>>>>>>>>>>>', coupon)
            if (!coupon) {
                return res.status(404).json({ message: 'Coupon not found' });
            }
            res.status(200).json({ message: 'Coupon deleted successfully' });
        } catch (error) {
            console.log(error, 'server error');
            return res.status(500).json({ message: 'Internal Server Error' });
        }
    };
    
module.exports = {
    couponPage,
    addCoupon,
    couponList,
    DeleteCoupon

}