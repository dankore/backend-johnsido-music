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

exports.apiHandleRoleAssignment = (req, res) => {
  Admin.handleRoleAssignment(req.body.userId, req.body.type)
    .then(response => {
      res.json(response);
    })
    .catch(error => {
      res.json(error);
    });
};

exports.apiHandleBanUser = (req, res) => {
  Admin.handleBanUser(req.body.userId, req.body.type)
    .then(response => {
      res.json(response);
    })
    .catch(error => {
      res.json(error);
    });
};

exports.apiAdminSearch = (req, res) => {
  Admin.adminSearch(req.params.searchText)
    .then(response => {
      res.json(response);
    })
    .catch(error => {
      res.json(error);
    });
};



