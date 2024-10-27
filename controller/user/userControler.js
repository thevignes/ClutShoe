const app = require("../../app");
const User = require("../../models/userModel");
const nodemailer = require("nodemailer");
const Address = require("../../models/address");
console.log(Address);
require("dotenv").config();
const bcrypt = require("bcrypt");
const Category = require("../../models/category");
const Product = require("../../models/product");
const Cart = require("../../models/cart");

const HomePage = async (req, res) => {
  try {
    // console.log('rendering')
    return res.render("home");
  } catch (error) {
    console.error(error);
    return res.status(500).send("Server Error");
  }
};
const PageNotFound = async (req, res) => {
  try {
    return res.render("PageNotfound");
  } catch (error) {
    res.redirect("PageNotfound");
  }
};

// const homePage = async (req, res) => {
//   try {
//     const user = req.session.user
//     const categories = await Category.find({isListed:true})
//     let ProductData = await Product.find({isListed:true,
//       category:{$in:categories.map(category => category._id)},quantity:{$gt:8}
//     })
//   ProductData.sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt) )
//   ProductData = ProductData.slice(0,4)
//     // res.render("/");
//     if(user){
//       const userData = await User.findOne({_id:user._id})
//       return res.render("home",{userData,ProductData})
//     }else{
//       return res.render("home",{ProductData})
//     }
//   } catch (error) {
//     console.error(error);
//     res.status(500).send("Server Error");
//   }
// };
const homePage = async (req, res) => {
  try {
    let ProductData = await Product.find({ isListed: true }).populate(
      "category"
    );
    console.log(ProductData);
    const user = req.session.user || null;
    if (!user) {
      return res.render("home", { user: "", ProductData });
    } else {
      return res.render("home", { user, ProductData });
    }

    // console.log(req.session.user);
    // const name = req.session.user.name;

    // const user = await User.findOne({ name });
    // console.log(id);

    // const categories = await Category.find({ isListed: true });
    // console.log(categories);

    // let ProductData = await Product.find({

    //   isListed: true,
    //   category: { $in: categories.map(category => category._id) },
    //   quantity: { $gt: 8 }
    // }).sort({ createdAt: -1 }).limit(4);
    if (user) {
      const userData = await User.findById(id);

      return res.render("home", { user, ProductData });
    } else {
      return res.render("home", { user, ProductData });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
};

const SignUp = async (req, res) => {
  try {
    return res.render("register");
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "server error" });
  }
};

// creating transport
const transport = nodemailer.createTransport({
  service: "gmail",
  host: process.env.MAIL_HOST,
  auth: {
    user: process.env.NODEMAILER_EMAIL,
    pass: process.env.NODEMAILER_PASSWORD,
  },
});

//transport for email service

const sendOtp = async (email, otp) => {
  const SendOTOption = {
    from: `ClutchShoe <${process.env.NODEMAILER_EMAIL}>`,
    to: email,
    subject: "ClutchShoe OTP Verification",
    text: `Your OTP is ${otp}`,
    html: `<b>Your OTP is ${otp}</b>`,
  };

  try {
    await transport.sendMail(SendOTOption);
    console.log(`OTP sent successfully to ${email}: ${otp}`);
  } catch (error) {
    console.error("Error sending OTP email:", error);
  }
};

const Registration = async (req, res) => {
  const otp = Math.floor(100000 + Math.random() * 900000);
  console.log("otpppppp:", otp);
  req.session.otp = otp;
  console.log("session otpppppp:", req.session.otp);

  try {
    const { email, password, name } = req.body;

    if (!email || email.trim() === "") {
      return res
        .status(400)
        .render("register", { message: "Email is required" });
    }

    const findUser = await User.findOne({ email });
    if (findUser) {
      return res.render("register", { message: "Email already exists" });
    }

    // Generate OTP and store in session

    req.session.Tempuser = { email, password, name };
    console.log(req.session, "first otp");

    console.log("calling ", req.session.Tempuser);
    await sendOtp(email, otp);
    return res.redirect("/verify-otp");
  } catch (error) {
    console.log("Error during registration:", error);
    return res.render("register", { message: "Internal server error" });
  }
};

const getOtp = async (req, res) => {
  try {
    res.render("verify-otp");
  } catch (error) {
    console.log(error);
    res.status(500).send("Server Error");
  }
};
const verifyOtp = async (req, res) => {
  try {
    const { otp } = req.body;

    if (!req.session.otp || !req.session.Tempuser) {
      return res.status(400).render("verify-otp", {
        message: "Session expired, please try again.",
      });
    }

    console.log("Entered OTP:", otp);
    console.log("Stored OTP:", req.session.otp);

    if (String(otp).trim() === String(req.session.otp).trim()) {
      const { email, password, name } = req.session.Tempuser;

      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = new User({
        email,
        password: hashedPassword,
        name,
      });

      console.log("Creating new user:", newUser);

      try {
        await newUser.save();
      } catch (saveError) {
        console.error("Error saving new user:", saveError);
        return res.render("verify-otp", {
          message: "User registration failed.",
        });
      }

      // Clear stored session data
      // req.session.otp = null;
      // req.session.Tempuser = null;

      return res.redirect("/login");
    } else {
      console.log("Invalid OTP entered.");
      return res.render("verify-otp", {
        message: "Invalid OTP. Please try again.",
      });
    }
  } catch (error) {
    console.log("Error during OTP verification:", error);
    return res.render("verify-otp", { message: "Internal server error." });
  }
};

///resend otp

const userLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // console.log("email ,password :  ", email, password);
    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(404)
        .send({ message: "User not found, please enter a valid email" });
    }
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res
        .status(401)
        .send({ message: "Incorrect password, please try again" });
    }
    if (user.IsBlocked) {
      return res.status(403).send({ message: "User were blocked" });
    }

    // console.log(user);
    // if(user){
    //   req.session.email = user.email
    //   return res.redirect('/')

    // }

    req.session.user = {
      name: user.name,
      email: user.email,
    };
    return res.status(200).redirect("/");
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .send({ message: "Server error, please try again later" });
  }
};

const resendOtp = async (req, res) => {
  console.log("OTP is:", req.session.otp);
  console.log("the main session", req.session.Tempuser);
  try {
    console.log(req.session);
    // console.log('FETCHINGGGG')

    if (!req.session.Tempuser) {
      return res.status(400).render("verify-otp", {
        message: "Session expired, please try again.",
      });
    }
    console.log("main", req.session.Tempuser);

    const newOtp = Math.floor(100000 + Math.random() * 900000);

    req.session.otp = newOtp;
    console.log(newOtp, "new otp");
    console.log(req.session, "after otp");
    console.log("main", req.session.Tempuser);

    const { email } = req.session.Tempuser;
    console.log(email, "email");

    const SendOTOption = {
      from: `ClutchShoe <${process.env.NODEMAILER_EMAIL}>`,
      to: email,
      subject: "ClutchShoe OTP Verification",
      text: `Your resend OTP is ${newOtp}`,
      html: `<b>Your resend OTP is ${newOtp}</b>`,
    };

    await transport.sendMail(SendOTOption);

    console.log(`OTP sent successfully to ${email}: ${newOtp}`);

    return res.render("verify-otp", {
      message: "A new OTP has been sent to your email.",
    });
  } catch (error) {
    console.error("Error during OTP resend:", error);
    return res.render("verify-otp", { message: "Internal server error" });
  }
  //
};

const VerifyResOtp = async (req, res) => {
  if (newOtp === req.session.newOtp) {
    res
      .render("home")
      .send({ success: true, message: "registered successfully" });
  } else {
    res.render("resend-otp").send({ success: false, message: "Invalid OTP" });
  }
};

const GetLogin = async (req, res) => {
  try {
    return res.render("login");
  } catch (error) {
    console.error(error);
    return res.status(500).send("Server Error");
  }
};

const ProducDetial = async (req, res) => {
  try {
    const user = req.session.user;
    const ProductId = req.params.id;
    let ProductData = await Product.findOne({
      _id: ProductId,
      isListed: true,
    }).populate("category");
    if (!ProductData) {
      return res.status(404).send({ message: "Product not found" });
    }

    res.render("productDetials", { user, ProductData });
  } catch (error) {
    console.error(error);
    return res.status(500).send("Server Error");
  }
};

const userLogout = async (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.log(err);
      return res.status(500).send("Logout failed. Please try again.");
    } else {
      res.clearCookie("connect.sid");
      return res.redirect("/");
    }
  });
};
const profile = async (req, res) => {
  try {
    const userId = req.session.user.email;
    console.log("hello", userId);

    const user = await User.findOne({ email: userId });
    console.log(user);

    if (!user) {
      return res.status(404).send("User not found");
    } else {
      res.render("profile", { user });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).send("Internal server error");
  }
};

const editProfile = async (req, res) => {
  try {
    const userId = req.session.user.email;

    const { name, email, currentPassword, newPassword } = req.body;

    const user = await User.findOne({ email: userId });
    if (!user) {
      return res.status(404).send("User not found     ");
    }

    user.name = name || user.name;
    user.email = email || user.email;

    if (currentPassword && newPassword && newPassword.trim() !== "") {
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).send("Current password is incorrect");
      }

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
    }

    await user.save();

    // console.log("Account successfully updated", user);
    if (email) {
      req.session.user.email = email;
      // console.log('the new email is' , email);
    }

    return res.redirect("/profile");
  } catch (err) {
    console.error(err);
    return res.status(500).send("Internal server error");
  }
};

const ManageAddress = async (req, res) => {
  try {
    const userId = req.session.user.email;
    const user = await User.findOne({ email: userId });
    // console.log('hello  mr' , user)
    if (!user) {
      return res.status(404).send("User not found ");
    }

    return res.render("manageAddress", { user });
  } catch (error) {
    console.error("Error fetching user:", error);
    return res.status(500).send("Internal server error");
  }
};

const addAddress = async (req, res) => {
  try {
    const userId = req.session.user;
    console.log(userId);
    const user = await User.findOne({ user: userId });
    console.log(user);

    const {
      address,
      state,
      pin,
      district,
      city,
      Firstname,
      Lastname,
      country,
      type,
    } = req.body;

    const newAddress = new Address({
      address,
      state,
      pin,
      district,
      city,
      Firstname,
      Lastname,
      country,
      type,
    });
    // user.addresses.push(newAddress);
    await newAddress.save();

    console.log("the adress is", newAddress);
    res.render("manageAddress", { user });
  } catch (err) {
    console.log(err);
    return res.status(500).send("actually its server error");
  }
};

const ViewAddress = async (req, res) => {
  try {
    // const userId = req.session.user
    const userId = req.session.user._id;
    const addresses = await Address.find({ UserId: userId });
    const user = await User.find();

    res.render("viewAddress", { user, addresses });
  } catch (error) {
    console.error("Error fetching user:", error);
    return res.status(500).send("Internal server error");
  }
};


const EditAddressPage = async (req, res) => {
  try {
    const userEmail = req.session.email;
    const { id } = req.params;

    console.log("User email from session: ", userEmail);
    console.log("Address ID from params: ", id);

    // Use `findOne` to find the address by both `_id` and `userEmail`
    const address = await Address.findOne({ _id: id, email: userEmail });

    console.log("Found address: ", address);

    if (!address) {
      return res.status(404).send("Address not found");
    }

    const user = await User.findOne({ email: userEmail });
    console.log("Found user: ", user);

    res.render("editAddress", { address, user });
  } catch (err) {
    console.log(err);
    return res.status(500).send("Internal Server Error");
  }
};


const EditAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.session.email; 
   
    const {
  
      state,
      pin,
      district,
      city,
      Firstname,
      Lastname,
      country,
      type,
    } = req.body;

    const updatedAddress = await Address.findOneAndUpdate(
      { email: userId }, 
      { $set: { Firstname,Lastname,city,state,district,pin,country,type} }, 
      { new: true }
    );

    await updatedAddress.save()

    const user = await User.findById(userId);


    res.render("editAddress", { user, addresses: updatedAddress });
    console.log('hwllo updated your address', updatedAddress)
  } catch (err) {
    console.error("Error updating address:", err);
    return res.status(500).send("Oops, server error!");
  }
};



const deletingAddress = async (req, res) => {
  try {
    const userEmail = req.session.email;
    const { id } = req.query;

    const deletedAddress = await Address.findOneAndDelete(
      { _id: id, email: userEmail }
    );

    if (!deletedAddress) {
      return res.status(404).send("Address not found");
    }

   return res.redirect('/view')
  } catch (err) {
    console.error(err);
    return res.status(500).send("Oops, server error!");
  }
};


const cartPage = async (req, res) => {
  try {
    console.log("Session data:", req.session);

    const user = req.session.user;
    console.log("hello heyy ", user);

    if (!user) {
      return res.redirect("/login");
    }

    const cart = await Cart.find({userId: user._id }).populate(
      "products.productId"
    );
    console.log("v<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>art: ",cart);
    

    if (!cart || cart.length === 0) {
      return res.render("cart", {
        message: "Your cart is empty",
        products: [],
        user,
        cartTotals: { total: 0 },
      });
    }


    const cartTotals = cart.reduce((acc, item) => {
      item.products.forEach((productEntry) => {
        const product = productEntry.productId;
        const productPrice = product.salePrice;
        const quantity = productEntry.quantity;
        
      
        productEntry.subtotal = quantity * productPrice;
        acc.total += productEntry.subtotal;
      });
      return acc;
    }, { total: 0 });
    
    console.log("tot: ",cartTotals);
    
 
    res.render("cart", {
      products: cart,
      cartTotals,
      message: null,
      user,
    });
  
  } catch (error) {
    console.error(error);
    res.status(500).send("Oops, server error!");
  }
};

const AddToCart = async (req, res) => {
  try {
    const  productId  = req.query.id; 
    console.log('the product is', productId);
    
    const user = req.session.user; 
    console.log('hello', user);

    if (!user) {    
      return res.redirect('/login'); 
    }

    const product = await Product.findById(productId); 
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found." });
    }

    let cart = await Cart.findOne({ userId: user._id }).populate("products.productId");

    if (!cart) {
      cart = new Cart({ userId: user._id, products: [] });
    }

    const existingProduct = cart.products.find((item) => item.productId._id.toString() === productId);

    if (existingProduct) {
   
    } else {
      cart.products.push({ productId: product._id }); 
    }

    await cart.save(); 
    console.log('Product added successfully', cart);
    

    res.redirect(`/ProducDetial/${productId}`);  
  } catch (error) {
    console.error("Error in AddToCart:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};


const removeFromCart = async (req, res) => {
  try {
    const productId = req.params.id; 
    console.log('the  are is ', productId)
    console.log('Product ID to remove:', productId);
    
    const user = req.session.user; 
    console.log('hello sir : == ', user);
    if (!user) {
      return res.redirect('/login'); 
    }

    // Find the user's cart
    const cart = await Cart.findOne({ userId: user._id });
    if (!cart) {
      return res.status(404).json({ success: false, message: "Cart not found." });
    }

    // Find the product in the cart
    const productIndex = cart.products.findIndex(item => item.productId.toString() === productId);
    if (productIndex === -1) {
      return res.status(404).json({ success: false, message: "Product not found in cart." });
    }

    // Soft delete the product
    cart.products[productIndex].isDeleted = true;


    console.log("Product marked as deleted from cart");
    res.redirect('/cart'); 
  } catch (err) {
    console.error("Error in RemoveFromCart:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};


const checkBlockedStatus = async (req, res, next) => {
  if (req.session.userId) { 
      const user = await User.findById(req.session.userId);
      if (user && user.IsBlocked) {
          req.session.destroy(() => {
              res.redirect('/login?message=Your account has been blocked.');
          });
      } else {
          next();
      }
  } else {
      res.redirect('/login');
  }
};

module.exports = {
  HomePage,
  PageNotFound,
  homePage,
  SignUp,
  Registration,
  verifyOtp,
  getOtp,
  GetLogin,
  resendOtp,
  VerifyResOtp,
  ProducDetial,
  userLogin,
  userLogout,
  profile,
  editProfile,
  ManageAddress,
  addAddress,
  ViewAddress,
  EditAddress,
  EditAddressPage,
  deletingAddress,
  cartPage,
  AddToCart,
  removeFromCart,
  checkBlockedStatus
};
