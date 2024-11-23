const Order = require('../../models/order')
const coupon = require('../../models/couponModels')
const product = require('../../models/product')
const Cart = require('../../models/cart')

const salesReport = async (req, res) => {
  try {
    const { filter, startDate, endDate } = req.query;

    let dateFilter = {};
    const currentDate = new Date();
    const startOfDay = new Date(currentDate.setHours(0, 0, 0, 0));


    if (filter === 'daily') {
      dateFilter = { createdAt: { $gte: startOfDay } };
    } else if (filter === 'weekly') {
      const weekStartDate = new Date();
      weekStartDate.setDate(currentDate.getDate() - 7);
      dateFilter = { createdAt: { $gte: weekStartDate } };
    } else if (filter === 'monthly') {
      const monthStartDate = new Date();
      monthStartDate.setMonth(currentDate.getMonth() - 1);
      dateFilter = { createdAt: { $gte: monthStartDate } };
    } else if (filter === 'custom') {
      if (startDate && endDate) {
        dateFilter = { createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) } };
      } else {
        return res.status(400).json({ message: 'Start and end dates are required for custom filter.' });
      }
    }


    const orders = await Order.find(dateFilter)
      .populate('products.productId', 'productName')
      .sort({ createdAt: -1 });

    const cart = await Cart.find();

    let overallSalesCount = 0;
    let overallOrderAmount = 0;
    let overallDiscount = 0;

    let todaySales = 0;
    let weeklySales = 0;
    let monthlySales = 0;

    
    if (orders.length > 0) {
      overallSalesCount = orders.length;

      orders.forEach((order) => {
        overallOrderAmount += order.total || 0;

        if (new Date(order.createdAt) >= startOfDay) {
          todaySales += order.total || 0;
        }


        const weekStartDate = new Date();
        weekStartDate.setDate(currentDate.getDate() - 7);
        if (new Date(order.createdAt) >= weekStartDate) {
          weeklySales += order.total || 0;
        }

     
        const monthStartDate = new Date();
        monthStartDate.setMonth(currentDate.getMonth() - 1);
        if (new Date(order.createdAt) >= monthStartDate) {
          monthlySales += order.total || 0;
        }
      });

      cart.forEach((cartItem) => {
        overallDiscount += cartItem.discountAmount || 0;
      });
    }


    const totalSalesAmount = overallOrderAmount;


    res.render('sales', {
      orders,
      cart,
      overallSalesCount,
      overallOrderAmount,
      overallDiscount,
      todaySales,
      weeklySales,
      monthlySales,
      totalSalesAmount, 
      filter: filter || '', 
      startDate: startDate || '', 
      endDate: endDate || '',
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Error fetching sales report' });
  }
};

module.exports = {
    salesReport  
}
  