var express = require('express');
var router = express.Router();
var dbManager = require('../lib/json_handler');

function IsLoggedIn(req, res, next) {
  if (req.session.username) {
    next();
  } else {
    res.status(200).json({ success: false, data: {} });
  }
}

router.get('/getconfig', IsLoggedIn, async function (req, res, next) {
  res.status(200).json({ success: true, data: await dbManager.getConfig() });
});

router.post('/saveconfig', IsLoggedIn, async function (req, res, next) {
  let saveC = await dbManager.saveConfig(req.body.config);
  if (saveC) {
    res.status(200).json({ success: true, data: dbManager.getConfig() });
  }  
});
module.exports = router;