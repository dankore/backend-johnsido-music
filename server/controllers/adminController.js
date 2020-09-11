const Admin = require('../models/adminModel');
exports.adminStats = async (req, res, next) => {
  const totalUsersPromise = Admin.countUsers();
  const [totalUsers] = await Promise.all([totalUsersPromise]);

  req.totalUsers = totalUsers;

  next();
};

exports.apiGetAdminStats = (req, res) => {
  res.json({
    adminStats: {
      totalUsers: req.totalUsers,
    },
  });
};
