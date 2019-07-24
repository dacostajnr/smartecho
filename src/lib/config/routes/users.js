var express = require('express');
var router = express.Router();
var dbManager = require('../lib/json_handler');

router.post('/login', async function(req, res, next) {
  let checkUser = await dbManager.checkUser(req.body.username, req.body.password);
  if (checkUser.success) {
    req.session.username = req.body.username;
    res.status(200).json({success: true, data: checkUser.user, siteName: checkUser.siteName});
  } else {
    res.status(200).json({success: false});
  }
});

router.get('/logout', function(req, res, next) {
  req.session.destroy();
  res.status(200).json({success: true, data: 'logged out'});
});

router.get('/isloggedin', function(req, res, next) {
  if (req.session.username) {
    res.status(200).json({success: true, data: req.session.username});
  } else {
    res.status(200).json({success: false, data: {}});
  }
});

router.post('/changepw', async function(req, res, next) {
  if (req.session.username) {
    let changePw = await dbManager.changePw(req.body.oldPw, req.body.newPw);
    if (changePw.success) {
      res.status(200).json({success: true, data: req.session.username});
    } else {
      res.status(200).json({success: false, data: changePw.data});
    }
  } else {
    res.status(200).json({success: false, data: {}});
  }
});

module.exports = router;
