const User =  require('../models/userModel')

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
module.exports  = checkBlockedStatus