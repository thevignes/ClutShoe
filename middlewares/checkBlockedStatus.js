const User =  require('../models/userModel')

const checkBlockedStatus = async (req, res, next) => {
  if (req.session.user_id) {
    const user = await User.findById(req.session.user_id);

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