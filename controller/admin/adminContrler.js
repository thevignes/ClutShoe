const Admin = require('../../models/adminModel');
const User = require('../../models/userModel');
const Order = require('../../models/order')


// Dashboard rendering function
const Dashboard = async (req, res) => {
  try {
    return res.render('dashboard'); 
  } catch (error) {
    console.log(error);
    res.status(500).send('Server Error');
  }
};

// Admin login page rendering
const AdminLogin = async (req, res) => {
  try {
    return res.render('signin'); 
  } catch (error) {
    console.log(error);
    return res.status(400).send({ message: "Can't get login page, server error" });
  }
};



// Admin login verification\

const AdminVerify = async (req, res) => {
  const { email, password } = req.body; 

  try {
  
    const admin = await Admin.findOne({ email });
    console.log('Admin:', admin);

    if (admin) {
      console.log('Admin found, checking password...');
      

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
    re.session.destroy((err)=>{
        if(err){
            console.log(err)
            return res.render('dashboard')
        }
        res.redirect('/admin/signin')
    })
}

const getUSers = async(req,res)=>{
    try{
    const user = await User.find()

    res.render('adminUsers',{user,currentPage:null,totalPages:null})

    // console.log(user)?
    }catch(err){
        console.log(err)
        res.status(500).send('Server error');
    }
}

        //  blocking user

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
        //unblocking user

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

        //user side pagination// User side pagination with search


const Userlist = async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page)) || 1;
  const limit = Math.max(1, parseInt(req.query.limit)) || 5;
  


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

      console.log("Current Page:", page);
      console.log("Total Pages:", totalPages);

      console.log("Rendering view with currentPage:", page);

      res.render('adminUsers', {
          user: users,
          currentPage: page,
          totalPages: totalPages,
          searchQuery:searchQuery
      });
  } catch (err) {
      console.log('Error fetching users:', err);
      res.status(500).send('Server Error');
  }
};


const orderList = async (req,res)=>{
  try {

    const   Orders = await Order.find().populate('userId', 'name').sort({ orderDate: -1 });

    
    console.log('the admin view', Orders)
    res.render('orderList', { Orders });


    
  } catch (error) {
    console.log('Error fetching orders:', error);
    res.status(500).send('Server Error');
    
  }
}


const OrderDetails = async (req,res)=>{
  try {
    const id = req.params.id;
    console.log(id)
    const order = await Order.findById(id).populate('userId', 'name')
    console.log('the order details', order)
    res.render('orderDetials', { order });
    
  } catch (error) {
    console.log('Error fetching order details:', error);
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
  OrderDetails
 
};


