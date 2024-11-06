const User = require('../models/userModel');
const express = require('express');
const CheckRouter = express.Router();

CheckRouter.use(async (req, res, next) => {
  try {
    console.log(req.session.user.email)
    if (req.session.user.email) {
      
      const user = await User.findOne({email: req.session.user_i});


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
  } catch (error) {
    console.error('Error checking user status:', error);
    res.status(500).send('Internal Server Error');
  }
});

module.exports = CheckRouter;
