const Coupon = require('../../models/couponModels');

const couponPage = async (req,res)=>{
    try {
        return res.render('coupon')
        
    } catch (error) {
        console.log(error, ' cannot get this page !');
        return res.status(500).json({ message: 'Internal Server Error' });
        
    }
}
const addCoupon = async (req, res) => {
    console.log('Starting addCoupon function');
    try {
        const {
       
            amount,
            couponCode,
            description,
            limit,
            expiryDate,
            userLimit,
            maxDiscount,
            minOrderValue,   
            discountType,
          
        } = req.body;
        
        console.log('Received coupon data:', req.body);

        // Check if coupon already exists
        const existingCoupon = await Coupon.findOne({ couponCode });
        if (existingCoupon) {
            return res.status(400).json({ message: 'Coupon already exists!' });
        }

        // Create new coupon instance
        const coupon = new Coupon({
        
            couponCode,
            amount,
            description,
            limit,
            userLimit,
            expiryDate,
            maxDiscount,
            minOrderValue,     
            discountType,
          
        });

        // Save to database
        await coupon.save();
        console.log('Coupon created successfully:', coupon);
        return res.status(201).json({ message: 'Coupon created successfully!' });

    } catch (error) {
        console.error('Error while adding coupon:', error.message);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};

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
const editCouponPage = async(req,res)=>{
    try {
        const couponId = req.params.id;
        const coupon = await Coupon.findById(couponId);
        console.log(coupon,'?????????????????????????????//')
        res.render('editCoupon',{coupon});
    } catch (error) {
        console.log(error, 'server error')
        return res.status(500).send('server error oops!')
        
    }
}
    const editCoupon = async (req, res) => {
        try {
            const { couponId } = req.body;
            const {
                couponCode,
                amount,
                description,
                limit,
                userLimit,
                expiryDate,
                maxDiscount,
                minOrderValue,
                discountType,
            } = req.body;
    
          
            if (!couponId) {
                return res.status(400).json({ error: "Coupon ID is required" });
            }
    
            
            const updatedCoupon = await Coupon.findByIdAndUpdate(
                couponId, 
                {
                    $set: {
                        couponCode,
                        amount,
                        description,
                        limit,
                        userLimit,
                        expiryDate,
                        maxDiscount,
                        minOrderValue,
                        discountType,
                    },
                },
                { new: true }
            );
    
   
            if (!updatedCoupon) {
                return res.status(404).json({ error: "Coupon not found" });
            }
    
        
            res.status(200).json({
                message: "Coupon updated successfully",
                coupon: updatedCoupon,
            });
        } catch (error) {
  console.log(error)
  return res.status(500).json({message: 'server error'})
        }
    }
    
    
module.exports = {
    couponPage,
    addCoupon,
    couponList,
    DeleteCoupon,
    editCoupon,
    editCouponPage

}