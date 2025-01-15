function isAdmin(req, res, next) {
  console.log(req.user)
  if (req.user.role === 'ADMIN') {
    return next();
  }

  res.redirect('/');
}

module.exports = isAdmin;
