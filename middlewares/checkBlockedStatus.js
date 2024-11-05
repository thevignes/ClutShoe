const User = require('../models/userModel');
const express = require('express');
const CheckRouter = express.Router();

// Use async to handle asynchronous operations
CheckRouter.use(async (req, res, next) => {
  try {
    if (req.session.user_id) {
      const user = await User.findById(req.session.user_id);

      // Check if the user is blocked
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
