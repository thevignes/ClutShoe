const Admin = require('../../models/adminModel');
const User = require('../../models/userModel');
const Order = require('../../models/order');
const Product = require('../../models/product');
const Category = require('../../models/categoryModel') 
const { use } = require('passport');

const Dashboard = async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate('products.productId', 'productName');

    const totalUser = await User.countDocuments();
    const totalProducts = await Product.countDocuments();
    const totalCategory = await Category.countDocuments();


    const [weeklyData, monthlyData, yearlyData] = await Promise.all([
      // Weekly data
      Order.aggregate([
        {
          $match: {
            status: { $ne: 'Cancelled' },
            createdAt: { 
              $gte: new Date(new Date().setDate(new Date().getDate() - 30)) 
            }
          }
        },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              week: { $week: '$createdAt' }
            },
            count: { $sum: 1 },
            totalAmount: { $sum: '$total' }
          }
        },
        {
          $sort: {
            '_id.year': 1,
            '_id.week': 1
          }
        }
      ]),

      // Monthly data
      Order.aggregate([
        {
          $match: {
            status: { $ne: 'Cancelled' },
            createdAt: {
              $gte: new Date(new Date().setMonth(new Date().getMonth() - 12)) 
            }
          }
        },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' }
            },
            count: { $sum: 1 },
            totalAmount: { $sum: '$total' }
          }
        },
        {
          $sort: {
            '_id.year': 1,
            '_id.month': 1
          }
        }
      ]),

      // Yearly data
      Order.aggregate([
        {
          $match: {
            status: { $ne: 'Cancelled' }
          }
        },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' }
            },
            count: { $sum: 1 },
            totalAmount: { $sum: '$total' }
          }
        },
        {
          $sort: {
            '_id.year': 1
          }
        }
      ])
    ]);

    //  total revenue
    const totalRevenue = await Order.aggregate([
      {
        $match: {
          status: { $ne: 'Cancelled' }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$total' }
        }
      }
    ]);

    //  most selling category
    const mostSellingCate = await Order.aggregate([
      { $unwind: '$products' },
      {
        $lookup: {
          from: 'products',
          localField: 'products.productId',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: '$product' },
      {
        $lookup: {
          from: 'categories',
          localField: 'product.category',
          foreignField: '_id',
          as: 'category'
        }
      },
      { $unwind: '$category' },
      {
        $group: {
          _id: '$category.name',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 1 }
    ]);


    //top 10 categories

    const topCategories = await Order.aggregate([
      {$unwind:'$products'},
      {
        $lookup:{
          from:'products',
          localField:'products.productId',
          foreignField:'_id',
          as:'product'
        }
      },
      {$unwind:'$product'},
      {
        $lookup:{
          from:'categories',
          localField:'product.category',
          foreignField:'_id',
          as:'Categories'
        }
      },
      {$unwind:'$Categories'},
      {
        $group:{
          _id: '$Categories._id',
          CategoryName: { $first: '$Categories.name' },
          totalSales: { $sum: '$products.quantity' },
          totalRevenue: { $sum: { $multiply: ['$products.quantity', '$product.salePrice'] } }
        }
      },
      {$sort:{totalSales:-1}},
      {$limit:10}

    ])

      //top 10 products
   const topProducts = await Order.aggregate([
      {$unwind:'$products'},
      {
        $lookup:{
          from:'products',
          localField:'products.productId',
          foreignField:'_id',
          as:'product'
        }
      },
      {$unwind:'$product'},
      {
        $group:{
          _id:'$product._id',
          productName: { $first: '$product.productName' },
          images: { $first: '$product.images' },
          totalSales:{$sum:'$products.quantity'},
          totalRevenue:{$sum:{$multiply:['$products.quantity', '$product.salePrice']}}
        }
      },
      {$sort:{totalSales:-1}},
      {$limit:10}
   ])

    return res.render('dashboard', {
      orders,
      totalProducts,
      totalUser,
      totalCategory,
      mostSellingCategory: mostSellingCate[0] || {},
      totalRevenue: totalRevenue[0]?.total || 0,
      topProducts,
      topCategories,
      chartData: {
        weekly: weeklyData,
        monthly: monthlyData,
        yearly: yearlyData,

      }
    });

  } catch (error) {
    console.log(error);
    res.status(500).send('Server Error');
  }
};

const AdminLogin = async (req, res) => {
  try {
    return res.render('signin'); 
  } catch (error) {
    console.log(error);
    return res.status(400).send({ message: "Can't get login page, server error" });
  }
};

const AdminVerify = async (req, res) => {
  const { email, password } = req.body; 

  try {
  
    const admin = await Admin.findOne({ email });
    console.log('Admin:', admin);

    if (admin) {
      

      if (password === admin.password) {
        console.log('Password matches, redirecting to dashboard');
        
    
        req.session.LoggedIn = true;
        req.session.admin = admin

        const searchQuery = req.query.search || '';
        return res.render('admin/dashboard',{ searchQuery: searchQuery});
      } else {
        console.log('Invalid password');
        
     
        return res.render('signin', { error: 'Invalid password' });
      }
    } else {
      console.log('Email not found');
      

      return res.render('signin', { error: 'Email not found' });
    }
  } catch (error) {
    console.log('Server Error:', error);
    return res.status(500).send('Server Error');
  }
  
};

const adminLogout = async(req,res)=>{
    req.session.destroy((err)=>{
        if(err){
            console.log(err)
            return res.render('dashboard')
        }
        res.redirect('/admin/signin')
    })
}

const getUSers = async(req,res)=>{
    try{
      const currentPage = parseInt(req.query.page)
      const itemsPerPage = 8
      const totalUser = await User.countDocuments()
      const totalPages = Math.ceil(totalUser/itemsPerPage)
      const skip = (currentPage-1)*itemsPerPage
    const user = await User.find().sort({createdAt:-1}).skip(skip).limit(itemsPerPage)
    res.render('adminUsers',{user,currentPage,totalPages})

    // console.log(user)?
    }catch(err){
        console.log(err)
        res.status(500).send('Server error');
    }
}

const blockUser = async(req,res)=>{
  try {
    const UserId = req.query.id

    await User.findByIdAndUpdate(UserId,{IsBlocked:true})
    res.redirect('/admin/user',)
    console.log('Blocking user with ID:', UserId);


  } catch (error) {
    console.log(error);
    res.status(500).send('Server Error');
    
  }
}

const UnblockUser = async(req,res)=>{
  try {
    const UserId = req.query.id

    await User.findByIdAndUpdate(UserId,{IsBlocked:false})
    res.redirect('/admin/user',)
    console.log('User Unblocked successfully')

    console.log('Unblocking user with ID:', UserId);
  } catch (error) {
    console.log(error);
    res.status(500).send('Server Error');
    
  }
}

const Userlist = async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page)) || 1;
  const limit = Math.max(1, parseInt(req.query.limit)) ||10 ;

  const searchQuery = req.query.search || '';

  try {
   
      const filter = searchQuery
          ? {
              $or: [
                  { name: { $regex: searchQuery, $options: 'i' } },
                  { email: { $regex: searchQuery, $options: 'i' } }
              ]
          }
          : {}; 

 
      const users = await User.find(filter)
          .skip((page - 1) * limit)
          .limit(limit);

  
      const totalUsers = await User.countDocuments(filter);
      const totalPages = Math.ceil(totalUsers / limit);

      
      res.render('adminUsers', {
          user:users,           
          currentPage: page, 
          totalPages,      
          searchQuery      
      });
  } catch (err) {
      console.log('Error fetching users:', err);
      res.status(500).send('Server Error');
  }
};

const orderList = async (req,res)=>{
  try {

    const currentPage = parseInt( req.query.page) || 1;
    const itemsPerPage = 10
    const totalOrders = await Order.countDocuments()
    const totalPages = Math.ceil(totalOrders/itemsPerPage);
    const skip = (currentPage-1)*itemsPerPage
console.log(currentPage)
    const   Orders = await Order.find().populate('userId', 'name').sort({ orderDate: -1 }).skip(skip).limit(itemsPerPage);

    
  
    res.render('orderList', { Orders,totalPages,currentPage });



    
  } catch (error) {
    console.log('Error fetching orders:', error);
    res.status(500).send('Server Error');
    
  }
}

const OrderDetails = async (req,res)=>{
  try {
    const id = req.params.id;
    console.log(id)
    const order = await Order.findById(id).populate('userId', 'name email')  .populate('products.productId', 'productName price images');
    console.log('the order details', order)
    res.render('orderDetials', { order });
    
  } catch (error) {
    console.log('Error fetching order details:', error);
    res.status(500).send('Server Error');

    
  }
}

const updateOrder = async (req,res)=>{
  try {
    const{orderId} = req.params;
    const {status} =req.body;

    const order = await Order.findByIdAndUpdate(orderId,{status},
      {new: true}
    );
    if(!order){
      return res.status(404).json({message:'Order not found'});
    }
    res.json({message:'Order updated successfully',order});
    console.log('order update successfully')
    
  } catch (error) {
    
      console.log('error updating order status', error)
      res.status(500).send('Server Error');
    
  }
}

module.exports = {
  Dashboard,
  AdminLogin,
  AdminVerify,
  adminLogout,
  getUSers,
  blockUser,
  UnblockUser,
  Userlist,
  orderList,
  OrderDetails,
  updateOrder
 
};
