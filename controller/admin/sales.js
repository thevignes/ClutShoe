const Order = require('../../models/order')
const coupon = require('../../models/couponModels')
const product = require('../../models/product')
const Cart = require('../../models/cart')

const salesReport = async (req, res) => {
  try {
    const { filter, startDate, endDate } = req.query;
    
    let dateFilter = {};

    // Determine the date range based on the filter selected
    const currentDate = new Date();
    
    if (filter === 'daily') {
      dateFilter = { createdAt: { $gte: new Date(currentDate.setHours(0, 0, 0, 0)) } };
    } else if (filter === 'weekly') {
      const weekStartDate = new Date();
      weekStartDate.setDate(currentDate.getDate() - 7);
      dateFilter = { createdAt: { $gte: weekStartDate } };
    } else if (filter === 'monthly') {
      const monthStartDate = new Date();
      monthStartDate.setMonth(currentDate.getMonth() - 1);
      dateFilter = { createdAt: { $gte: monthStartDate } };
    } else if (filter === 'custom' && startDate && endDate) {
      dateFilter = { createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) } };
    }

    const orders = await Order.find(dateFilter)
      .populate('products.productId')
      .sort({ createdAt: -1 });

    const cart = await Cart.find();

    let overallSalesCount = 0;
    let overallOrderAmount = 0;
    let overallDiscount = 0;

    if (orders && orders.length > 0) {
      overallSalesCount = orders.length;

      orders.forEach(order => {
        overallOrderAmount += order.total || 0;
      });

      cart.forEach(cartItem => {
        overallDiscount += cartItem.discountAmount || 0;
      });
    } else {
      return res.status(400).json({ message: 'No orders found' });
    }

    res.render('sales', {
      orders,
      cart,
      overallSalesCount,
      overallOrderAmount,
      overallDiscount,
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Error fetching sales report' });
  }
};




module.exports = {
    salesReport  
}
  