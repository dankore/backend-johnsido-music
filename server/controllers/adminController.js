const Admin = require('../models/adminModel');
exports.adminStats = async (req, res, next) => {
  const allUserDocsPromise = Admin.allUserDocs();
  const [allUserDocs] = await Promise.all([allUserDocsPromise]);

  req.allUserDocs = allUserDocs;

  next();
};

exports.apiGetAdminStats = (req, res) => {
  res.json({
    adminStats: {
      allUserDocs: req.allUserDocs,
    },
  });
};
