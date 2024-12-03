const mongoose = require("mongoose");
const app = require("../../app");
const User = require("../../models/userModel");
const nodemailer = require("nodemailer");
const Address = require("../../models/address");
require("dotenv").config();
const bcrypt = require("bcrypt");
const Category = require("../../models/categoryModel");
const Product = require("../../models/product");
const Cart = require("../../models/cart");
const Order = require("../../models/order");
const Coupon = require("../../models/couponModels");
const Wallet = require("../../models/wallet");
const { v4: uuidv4 } = require('uuid');

const HomePage = async (req, res) => {
  try {
   
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


const homePage = async (req, res) => {
  try {
    let ProductData = await Product.find({ isListed: true }).populate(
      "category.name"
    );

    const user = req.session.user || null;
    console.log("hello use", user);

    if (user && user.IsBlocked) {
      req.session.user = null;
      req.session.destroy((err) => {
        if (err) {
          console.error("Failed to destroy session:", err);
          return res.status(500).send("Server Error");
        }
        return res.redirect("/login");
      });
      return;
    }

    if (!user) {
      return res.render("home", { user: "", ProductData });
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
  req.session.expireOtp = Date.now() + 10 * 60 * 1000;

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

    // Generating OTP and store in session

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

   
    if (
      !req.session.otp ||
      !req.session.Tempuser ||
      req.session.expireOtp < Date.now()
    ) {
      return res.status(400).render("verify-otp", {
        message: "Session expired, please try again.",
        alertType: "error",
      });
    }

    console.log("Entered OTP:", otp);
    console.log("Stored OTP:", req.session.otp);
    if (String(otp).trim() === String(req.session.otp).trim()) {
      const { email, password, name } = req.session.Tempuser;


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
          alertType: "error",
        });
      }


      return res.render("verify-otp", {
        message: "Registration successful! Redirecting to login...",
        alertType: "success",
        redirectUrl: "/login",
      });
    } else {
      console.log("Invalid OTP entered.");
      return res.render("verify-otp", {
        message: "Invalid OTP. Please try again.",
        alertType: "error",
      });
    }
  } catch (error) {
    console.log("Error during OTP verification:", error);
    return res.render("verify-otp", {
      message: "Internal server error.",
      alertType: "error",
    });
  }
};

///resend otp
const userLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found, please enter a valid email" });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res
        .status(401)
        .json({ success: false, message: "Incorrect password, please try again" });
    }

    if (user.IsBlocked) {
      return res.status(403).json({ success: false, message: "User is blocked" });
    }

  
    let wallet = await Wallet.findOne({ userId: user._id });
    if (!wallet) {
      wallet = new Wallet({
        userId: user._id,
        balance: 0,
        transaction: [],
      });
      await wallet.save();
    }

    req.session.user = {
      name: user.name,
      email: user.email,
    };
    
    return res.status(200).json({ 
      success: true, 
      message: "Login successful",
      redirectUrl: "/"
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ 
      success: false, 
      message: "Server error, please try again later" 
    });
  }
};

const resendOtp = async (req, res) => {
 
  try {
  

    if (!req.session.Tempuser) {
      return res.status(400).render("verify-otp", {
        message: "Session expired, please try again.",
      });
    }
   

    const newOtp = Math.floor(100000 + Math.random() * 900000);

    req.session.otp = newOtp;
    

    const { email } = req.session.Tempuser;
 

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
    const MAX_QUANTITY_PER_PRODUCT = 5;
    let ProductData = await Product.findOne({
      _id: ProductId,
      isListed: true,
    }).populate("category");

    if (!ProductData) {
      return res.status(404).send({ message: "Product not found" });
    }

    const category = ProductData.category;

    const relatedProducts = await Product.find({
      category: category,
      _id: { $ne: ProductId },
    }).limit(4);

    res.render("productDetials", {
      user,
      ProductData,
      relatedProducts,
      MAX_QUANTITY_PER_PRODUCT,
    });
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
    const userEmail = req.session.user.email;

 

    if (!userEmail) {
      console.error(
        "userEmail is undefined or null. Check your session configuration."
      );
      return res.status(400).send("Email is not defined in session.");
    }


    const user = await User.findOne({
      email: new RegExp(`^${userEmail}$`, "i"),
    });
    if (!user) {
     
      return res.status(404).send("User not found");
    }

    console.log("User found:", user);

 
    res.render("profile", { user });
  } catch (err) {
    console.error("Error occurred:", err);
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

   
    if (email) {
      req.session.user.email = email;

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
    const userId = req.session.user.email;
  
    const user = await User.findOne({ email: userId });


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

   
    const oid = uuidv4();

    const newAddress = new Address({
      userId: user._id,
      state,
      pin,
      district,
      city,
      Firstname,
      Lastname,
      country,
      type,
      oid 
    });

    await newAddress.save();


    res.render("manageAddress", { user });
  } catch (err) {
    console.log(err);
    return res.status(500).send("actually its server error");
  }
};

const ViewAddress = async (req, res) => {
  try {
    // const userId = req.session.user

    const userEmail = req.session.user.email;
    const user = await User.findOne({ email: userEmail });
    const addresses = await Address.find({ userId: user._id });

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



    const address = await Address.findOne({ _id: id, email: userEmail });



    if (!address) {
      return res.status(404).send("Address not found");
    }

    const user = await User.findOne({ email: userEmail });
    

    res.render("editAddress", { address, user });
  } catch (err) {
    console.log(err);
    return res.status(500).send("Internal Server Error");
  }
};

const EditAddress = async (req, res) => {
  try {
    const { id } = req.params; 
    const userEmail = req.session.user.email; 




    const user = await User.findOne({ email: userEmail });

    if (!user) {
      return res.status(404).send("User not found");
    }

    const { state, pin, district, city, Firstname, Lastname, country, type } =
      req.body;

    const updatedAddress = await Address.findOneAndUpdate(
      { _id: id, userId: user._id }, 
      {
        $set: {
          Firstname,
          Lastname,
          city,
          state,
          district,
          pin,
          country,
          type,
        },
      },
      { new: true } 
    );

    if (!updatedAddress) {
      return res
        .status(404)
        .send("Address not found or not authorized to update");
    }

 

    res.render("editAddress", { user, addresses: updatedAddress });
  } catch (err) {
    console.error("Error updating address:", err);
    return res.status(500).send("Oops, server error!");
  }
};

const deletingAddress = async (req, res) => {
  try {
    const userEmail = req.session.email;
    const { id } = req.query;

    const deletedAddress = await Address.findOneAndDelete({
      _id: id,
      email: userEmail,
    });

    if (!deletedAddress) {
      return res.status(404).send("Address not found");
    }

    return res.redirect("/view");
  } catch (err) {
    console.error(err);
    return res.status(500).send("Oops, server error!");
  }
};

const cartPage = async (req, res) => {
  try {
    const userEmail = req.session.user?.email;
    const { productId, change } = req.body;

    const userDoc = await User.findOne({ email: userEmail });
    if (!userDoc) {
      return res.redirect("/login");
    }

    const cart = await Cart.findOne({ userId: userDoc._id }).populate(
      "products.productId"
    );
    if (!cart || cart.products.length === 0) {
      return res.render("cart", {
        message: "Your cart is empty go and  add something into cart",
        products: [],
        user: userDoc,
        cartTotals: { total: 0 },
      });
    }

    if (productId && change !== undefined) {
      const productEntry = cart.products.find(
        (item) => item.productId._id.toString() === productId
      );
      if (productEntry) {
        productEntry.quantity += change;
        productEntry.quantity = Math.max(productEntry.quantity, 1);
        await cart.save();
      }
    }

    // Calculate cart totals
    const cartTotals = cart.products.reduce(
      (acc, productEntry) => {
        const product = productEntry.productId;
        const productPrice = product.salePrice;
        const quantity = productEntry.quantity;

        productEntry.subtotal = quantity * productPrice;
        acc.total += productEntry.subtotal;
        return acc;
      },
      { total: 0 }
    );

    res.render("cart", {
      products: cart.products,
      cartTotals,
      message: null,
      user: userDoc,
      cart,
    });

;
  } catch (error) {
    console.error(error);
    res.status(500).send("Oops, server error!");
  }
};

const AddToCart = async (req, res) => {
  try {
    const productId = req.query.id;
    const selectedSize = req.body.size;
    
    if (!req.session.user) {
      return res.status(401).json({ message: 'please login first' });
    }

    const userEmail = req.session.user.email;
    const user = await User.findOne({ email: userEmail });
    
    if (!user) {
      return res.status(401).json({ message: 'please login first' });
    }

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found." });
    }


   
   
    
    const sizeNumber = Number(selectedSize);
    
    const sizeObj = product.sizes.find(sizeData => sizeData.size === sizeNumber);

    if (!sizeObj) {
        return res.status(400).json({ success: false, message: "Please select a valid size." });
    }

    if (sizeObj.quantity <= 0) {
        return res.status(400).json({ success: false, message: "Selected size is out of stock." });
    }

    const quantity = parseInt(req.body.quantity, 10) || 1;

    if (sizeObj.quantity < quantity) {
      return res.status(400).json({ 
        success: false, 
        message: `Only ${sizeObj.quantity} items available for size ${selectedSize}.` 
      });
    }

    let cart = await Cart.findOne({ userId: user._id }).populate("products.productId");

    if (!cart) {
      cart = new Cart({ userId: user._id, products: [] });
    }

    const existingProduct = cart.products.find(
      (item) => item.productId._id.toString() === productId && item.size === selectedSize
    );

    if (existingProduct) {
      if (existingProduct.quantity + quantity > sizeObj.quantity) {
        return res.status(400).json({ 
          success: false, 
          message: `Cannot add more items. Only ${sizeObj.quantity} available for size ${selectedSize}.` 
        });
      }
      existingProduct.quantity += quantity;
    } else {
      cart.products.push({
        productId: product._id,
        quantity: quantity,
        size: selectedSize,
        price: product.salePrice,
        offerPrice: product.salePrice,
      });
    }

    cart.totalAmount = cart.products.reduce(
      (acc, product) => product.price + acc,
      0
    );
    cart.discountAmount = cart.products.reduce(
      (acc, product) => acc + (product.price - product.offerPrice),
      0
    );
    await cart.save();

    res.status(200).json({ 
      success: true, 
      message: "Product added to cart successfully" 
    });
  } catch (error) {
    console.error("Error in AddToCart:", error);
    return res.status(500).json({
      success: false,
      message: "Cannot add this product to cart. Server error.",
    });
  }
};

const removeFromCart = async (req, res) => {
  try {
    const productId = req.params.id;
  

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid Product ID." });
    }

    const user = req.session.user;
    if (!user) {
      return res.redirect("/login");
    }

    const userDoc = await User.findOne({ email: user.email });
    if (!userDoc) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }

    const cart = await Cart.findOne({ userId: userDoc._id });
    if (!cart) {
      return res
        .status(404)
        .json({ success: false, message: "Cart not found." });
    }

    console.log(
      "Cart products before removal:",
      cart.products.map((product) => product.productId.toString())
    );

    cart.products = cart.products.filter(
      (product) => product._id.toString() !== productId
    );

    console.log(
      "Cart products after removal:",
      cart.products.map((product) => product.productId.toString())
    );

    await cart.save();
    console.log("Cart saved successfully after removing the product.");

    res.redirect("/cart");
  } catch (err) {
    console.error("Error in removeFromCart:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

const checkout = async (req, res) => {
  try {
    const userId = req.session.user.email;
    const orderValue = req.session.orderValue;
    const coupons = await Coupon.find({});


    const user = await User.findOne({ email: userId });
    if (!user) {
      return res.redirect("/login");
    }

    const cart = await Cart.findOne({ userId: user._id }).populate(
      "products.productId"
    );
    const addresses = await Address.find({ userId: user._id });

    if (!cart || cart.products.length === 0) {
      return res.render("checkout", {
        message: "Your cart is empty",
        products: [],
        user: userId,
        cartTotals: { total: 0, discount: 0, finalTotal: 0 },
        addresses,
        orderValue,
        userId,
        coupons,
        cart
      });
    }

    const cartTotals = cart.products.reduce(
      (acc, productEntry) => {
        const product = productEntry.productId;
        const productPrice = product.salePrice;
        const quantity = productEntry.quantity;

        productEntry.subtotal = quantity * productPrice;
        acc.total += productEntry.subtotal;
        return acc;
      },
      { total: 0 }
    );

    cartTotals.deliveryCharge = cartTotals.total < 1000? 40:0;
    cartTotals.finalTotal = cartTotals.total + cartTotals.deliveryCharge;




    let couponDetails = null;
    if (cart && cart.couponCode) {
      couponDetails = await Coupon.findOne({ couponCode: cart.couponCode });
    }
   

    res.render("checkOut", {
      products: cart.products,
      cartTotals,
      message: null,
      user: userId,
      addresses,
      orderValue,
      userId,
      coupons,
      cart,
      coupon: couponDetails
    });
  } catch (error) {
    console.error("Error in checkout function:", error);
    res.status(500).send("Oops, server error!");
  }
};

const shopPage = async (req, res) => {
  try {
    const sortOption = req.query.sort || "featured";
    const sizeSortOption = req.query.sizeSort || ""; 
    const currentPage = parseInt(req.query.page) || 1;
    const itemsPerPage = parseInt(req.query.limit) || 5;
    const searchQuery = req.query.q || "";
    const categoryFilter = req.query.category || "";



   
    const categories = await Category.find();
    const categoryCounts = {};
    

    for (const category of categories) {
      const count = await Product.countDocuments({
        isListed: true,
        category: category._id
      });
      categoryCounts[category.name] = count;
    }

    let sortQuery = {};
    switch (sortOption) {
      case "lowToHigh":
        sortQuery = { salePrice: 1 };
        break;
      case "highToLow":
        sortQuery = { salePrice: -1 };
        break;
      case "aToZ":
        sortQuery = { productName: 1 };
        break;
      case "zToA":
        sortQuery = { productName: -1 };
        break;
      default:
        sortQuery = {};
    }

    if (sizeSortOption) {
      if (sizeSortOption === "smallToLarge") {
        sortQuery.size = 1;
      } else if (sizeSortOption === "largeToSmall") {
        sortQuery.size = -1;
      }
    }

    console.log("Sort Query:", sortQuery);

    let categoryFilterQuery = {};
    if (categoryFilter) {
      console.log("Looking for category:", categoryFilter);
      const category = await Category.findOne({
        name: { $regex: new RegExp(`^${categoryFilter}$`, "i") },
      });

      if (category) {
        categoryFilterQuery = { category: category._id };
        console.log("Category found:", category);
      } else {
        console.log("No category found with name:", categoryFilter);
        return res.status(400).send("Invalid category");
      }
    }

  
    const totalProducts = await Product.countDocuments({
      isListed: true,
      ...categoryFilterQuery,
    });
    const totalPages = Math.ceil(totalProducts / itemsPerPage);
    const skip = (currentPage - 1) * itemsPerPage;

 
    const ProductData = await Product.find({
      isListed: true,
      productName: { $regex: searchQuery, $options: "i" },
      ...categoryFilterQuery,
    })
      .populate("category")
      .sort(sortQuery)
      .skip(skip)
      .limit(itemsPerPage);

    const user = req.session.user || null;
    return res.render("shop", {
      user: user || "",
      ProductData,
      sortOption,
      sizeSortOption,
      currentPage,
      totalPages,
      itemsPerPage,
      searchQuery,
      categoryFilter,
      categories,
      categoryCounts
    });
    
  } catch (error) {
    console.error("Error in shopPage:", error);
    return res.status(500).send("Server error, please try again");
  }
};

const PlaceOrder = async (req, res) => {
  try {
    const { paymentOption, addressId,amount } = req.body;

    const userEmail = req.session.user.email;
    const user = await User.findOne({ email: userEmail });
    const address = await Address.findOne({ userId: user._id, _id: addressId });
    const products = await Cart.findOne({ userId: user._id }).populate(
      "products.productId"
    );

    const oid = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    if (!address) {
      return res.status(400).send("Invalid Address");
    }

    console.log("Address:", address);

    let total = 0;

    const productDetails = await Promise.all(
      products.products.map(async (item) => {
        const product = await Product.findById(item.productId._id);

        if (!product) {
          throw new Error(`Product not found for ID: ${item.productId}`);
        }

        const subtotal = item.productId.salePrice * item.quantity;
        console.log("Subtotal:", subtotal);
        total += subtotal;

        return {
          productId: item.productId._id,
          quantity: item.quantity,
          price: item.productId.salePrice,
          subtotal,
          size: item.size
        };
      })
    );

    const cart = await Cart.findOne({userId: user._id});

    const finalTotal = total - (cart.discountAmount || 0);

    if (paymentOption === "COD") {
      console.log("COD Check - Final Total:", finalTotal);
      if (finalTotal >= 1000) {
        return res.status(400).json({
          success: false,
          message: 'Cash on delivery is only available for orders below ₹1000'
        });
      }
    }

    if (paymentOption === "wallet") {
      const walletBalance = await Wallet.findOne({ userId: user._id });
      if (!walletBalance || walletBalance.balance < finalTotal) {
        return res
          .status(400)
          .json({ message: " wallet balance is not enough " });
      }

      walletBalance.balance -= finalTotal;
   
      walletBalance.transaction.push({
        type: "debit",
        amount: finalTotal,
        description: `Order Payment for ${oid}`,
      });
      await walletBalance.save();
      console.log(">>>>>>>>>>", walletBalance);
    }
    const order = new Order({
      oid,
      userId: user._id,
      products: productDetails,
      total:finalTotal,
      paymentMethod: paymentOption,
      address: {
        Firstname: address.Firstname,
        Lastname: address.Lastname,
        city: address.city,
        state: address.state,
        pin: address.pin,
        country: address.country,
      },
    });

    await order.save();

    await Promise.all(
      productDetails.map(async (item) => {
        const product = await Product.findById(item.productId);
        if (product) {
    
          const sizeObj = product.sizes.find(s => s.size === item.size);
          
          if (!sizeObj) {
            throw new Error(`Size ${item.size} not found for product ID: ${item.productId}`);
          }
          
          if (sizeObj.quantity >= item.quantity) {
    
            sizeObj.quantity -= item.quantity;
            await product.save();
            console.log(`Updated quantity for product ID: ${item.productId}, size: ${item.size}`);
          } else {
            throw new Error(
              `Insufficient stock for product ID: ${item.productId}, size: ${item.size}`
            );
          }
        }
      })
    );

    await Cart.findOneAndUpdate(
      { userId: user._id },
      { $set: { products: [] } }
    );

    return res
      .status(200)
      .json({ success: true, message: "Order placed successfully" });
  } catch (error) {
    console.error("Error placing order:", error);
    res.status(500).send("Oops! Server error, please try again later.");
  }
};

const successpage = async (req, res) => {
  try {
    res.render("success");
  } catch (error) {
    console.error("Error redirecting to success page:", error);
    return res.status(500).send("!oops cannot get this page");
  }
};

const myOrders = async (req, res) => {
  try {
    const userEmail = req.session.user.email;

    const currentPage = parseInt(req.query.page)||1
    const itemsPerPage = 5

    const user = await User.findOne({ email: userEmail });

    if (!user) {
      return res.status(401).send("!you are not logged in");
    }
    const totalOrders = await Order.countDocuments({userId:user._id})
    const totalpages = Math.ceil(totalOrders/itemsPerPage)
    const skip = (currentPage-1)*itemsPerPage


    const Orders = await Order.find({ userId: user._id }).populate(
      "products.productId"
    ).sort({createdAt:-1})
    .skip(skip)
    .limit(itemsPerPage)


    res.render("order", { Orders, user,currentPage,totalpages });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return res.status(500).send("!oops cannot get this page");
  }
};

const cancelOrder = async (req, res) => {
  try {
    const orderId = req.body.orderId;
    const userEmail = req.session.user.email;

    const user = await User.findOne({ email: userEmail });
 


    const order = await Order.findOne({ oid: orderId });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.status === "Cancelled") {
      return res.status(400).json({ message: "Order is already cancelled" });
    }

    const wallet = await Wallet.findOne({ userId: user?._id });

    if (!wallet) {
      return res.status(404).json({ message: "Wallet not found" });
    }

    const refundAmount = order.total;
    wallet.balance += refundAmount;
    wallet.transaction.push({
      type: "credit",
      amount: refundAmount,
      description: `Refund for canceled order ${orderId}`,
    });

    await Wallet.updateOne({ userId: user?._id }, wallet);

    order.status = "Cancelled";
    await order.save();

    res.redirect("/order");
  } catch (error) {
    console.log(error);
    return res.status(500).send("Oops! Server error");
  }
};

const returnOrder = async (req, res) => {
  try {
    const orderId = req.body.orderId;
    const userEmail = req.session.user.email;

    const user = await User.findOne({ email: userEmail });

    const order = await Order.findOne({ oid: orderId });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.status === "Returned") {
      return res.status(400).json({ message: "Order is already Returned" });
    }

    const wallet = await Wallet.findOne({ userId: user?._id });

    if (!wallet) {
      return res.status(404).json({ message: "Wallet not found" });
    }

    const refundAmount = order.total;
    wallet.balance += refundAmount;

    wallet.transaction.push({
      type: "credit",
      amount: refundAmount,
      description: `Refund for canceled order ${orderId}`,
    });

    await Wallet.updateOne({ userId: user?._id }, wallet);
    order.status = "Returned";
    await order.save();

    return res.status(200).json({ message: 'The product was returned successfully!' });
  } catch (error) {
    return res.status(500).send("Oops! Server error");
  }
};

const searchProducts = async (req, res) => {
  try {
    const user = req.session.user || null;
    const searchQuery = req.query.q || "";
    const sortOption = req.query.sort || "featured";
    const currentPage = parseInt(req.query.page) || 1;
    const itemsPerPage = parseInt(req.query.limit) || 5;

    const escapeRegex = (text) =>
      text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
    const regex = searchQuery
      ? new RegExp(escapeRegex(searchQuery), "i")
      : null;

    const totalProducts = await Product.countDocuments({
      isListed: true,
      ...(regex && { productName: regex }),
    });

    const totalPages = Math.ceil(totalProducts / itemsPerPage);
    const skip = (currentPage - 1) * itemsPerPage;

    const ProductData = await Product.find({
      isListed: true,
      ...(regex && { productName: regex }),
    })
      .populate("category")
      .skip(skip)
      .limit(itemsPerPage);

    const categories = await Category.find();
    const categoryCounts = {};
    
    for (const category of categories) {
      const count = await Product.countDocuments({
        isListed: true,
        category: category._id
      });
      categoryCounts[category.name] = count;
    }

    res.render("shop", {
      user,
      ProductData,
      sortOption,
      currentPage,
      itemsPerPage,
      totalPages,
      searchQuery,
      categories,
      categoryCounts
    });

  } catch (error) {
    console.error("Error searching for products:", error);
    res.status(500).send("Server Error");
  }
};



const ForgetPas = async (req, res) => {
  try {
    res.render("forgetPassword");
  } catch (error) {
    res.status(500).send("Unable to get this page");
  }
};

const updateQuantity = async (req, res) => {
  try {
    const { newQuantity, itemId } = req.body;
    const email = req.session.user.email;

    if (!email) {
      return res.status(401).json({ message: "Please login to update cart" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    const cart = await Cart.findOne({ userId: user._id });
    if (!cart) {
      return res.status(400).json({ message: "Cart not found" });
    }

    const existingItem = cart.products.findIndex(
      (item) => item._id.toString() == itemId
    );
    if (existingItem == -1) {
      return res.status(400).json({ message: "Product not found in cart" });
    }

    cart.products[existingItem].quantity = newQuantity;
    await cart.save();
    
    return res.status(200).json({ message: "Quantity updated successfully" });
  } catch (error) {
    console.error("Error in updateQuantity:", error);
    return res.status(500).json({ message: "Failed to update quantity" });
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

  // relatedProduct
  shopPage,
  checkout,
  PlaceOrder,
  successpage,
  myOrders,
  cancelOrder,
  searchProducts,
  updateQuantity,
  ForgetPas,
  returnOrder,
};
