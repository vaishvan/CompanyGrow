const isAdminOrManager = (req, res, next) => {
  if (req.user.role === 'admin' || req.user.role === 'manager') {
    next();
  } else {
    return res.status(403).json({ message: 'Access denied. Admin or Manager role required.' });
  }
};

const isAdmin = (req, res, next) => {
  if (req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({ message: 'Access denied. Admin role required.' });
  }
};

module.exports = {
  isAdminOrManager,
  isAdmin
};
