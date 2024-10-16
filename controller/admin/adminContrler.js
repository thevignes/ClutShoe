const Admin = require('../../models/adminModel');
const User = require('../../models/userModel');


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
        return res.redirect('/admin/dashboard');
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

    res.render('adminUsers',{user})

    // console.log(user)?
    }catch(err){
        console.log(err)
        res.status(500).send('Server error');
    }
}

        //  blocking user

        const blockUser = async(req,res)=>{
          try {
            const UserId = req.params .id

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
            const UserId = req.params.id

            await User.findByIdAndUpdate(UserId,{IsBlocked:false})
            res.redirect('/admin/user',)
            console.log('User Unblocked successfully')

            console.log('Unblocking user with ID:', UserId);
          } catch (error) {
            console.log(error);
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
 
};
