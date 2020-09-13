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

exports.apiDowngradeAdminToUser = (req, res) => {
  Admin.downgradeAdminToUser(req.body.userId)
    .then(response => {
      res.json(response);
    })
    .catch(error => {
      res.json(error);
    });
};
