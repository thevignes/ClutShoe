const Order = require('../../models/order')
const coupon = require('../../models/couponModels')
const product = require('../../models/product')
const Cart = require('../../models/cart')
const ExcelJS = require('exceljs');

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



const exportSalesReportToExcel = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('userId', 'name email')
      .populate('products.productId', 'productName price')
      .sort({ createdAt: -1 });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Sales Report');

    worksheet.columns = [
      { header: 'Order ID', key: 'orderId', width: 20 },
      { header: 'Date', key: 'date', width: 15 },
      { header: 'Customer', key: 'customer', width: 25 },
      { header: 'Product', key: 'product', width: 25 },
      { header: 'Quantity', key: 'quantity', width: 10 },
      { header: 'Unit Price', key: 'unitPrice', width: 15 },
      { header: 'Total', key: 'total', width: 15 }
    ];

    orders.forEach(order => {
      if (order.products && order.products.length > 0) {
        order.products.forEach(product => {
          try {
            worksheet.addRow({
              orderId: order._id.toString(),
              date: order.createdAt.toLocaleDateString(),
              customer: order.userId?.name ,
              product: product.productId?.productName,
              quantity: product.quantity,
              unitPrice: product.price,
              total: product.quantity * product.price
            });
          } catch (err) {
            console.error('Error adding row:', err);
          }
        });
      }
    });

    const filename = `sales_report_${new Date().toISOString().split('T')[0]}.xlsx`;

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);

    await workbook.xlsx.write(res);
    res.end();

  } catch (error) {
    console.error('Error exporting sales report:', error);
    res.status(500).json({ message: 'Error exporting sales report' });
  }
};



module.exports = {
    salesReport,
    exportSalesReportToExcel
}
  