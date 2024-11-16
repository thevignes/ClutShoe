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

    // Apply date filters based on selection
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

    // Fetch orders based on the filter
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

    // Process order data if orders exist
    if (orders.length > 0) {
      overallSalesCount = orders.length;

      orders.forEach((order) => {
        overallOrderAmount += order.total || 0;

        // Calculate daily sales
        if (new Date(order.createdAt) >= startOfDay) {
          todaySales += order.total || 0;
        }

        // Calculate weekly sales
        const weekStartDate = new Date();
        weekStartDate.setDate(currentDate.getDate() - 7);
        if (new Date(order.createdAt) >= weekStartDate) {
          weeklySales += order.total || 0;
        }

        // Calculate monthly sales
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

    // Calculate total sales amount (same as overallOrderAmount)
    const totalSalesAmount = overallOrderAmount;

    // Render the data with additional sales summaries
    res.render('sales', {
      orders,
      cart,
      overallSalesCount,
      overallOrderAmount,
      overallDiscount,
      todaySales,
      weeklySales,
      monthlySales,
      totalSalesAmount, // Pass totalSalesAmount to the template
      filter: filter || '', // Pass filter to the template (ensure it's not undefined)
      startDate: startDate || '', // Ensure startDate is always defined
      endDate: endDate || '', // Ensure endDate is always defined
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Error fetching sales report' });
  }
};

module.exports = {
    salesReport  
}
  