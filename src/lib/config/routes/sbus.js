var express = require('express');
var router = express.Router();
var sbusLib = require('sbus-gateway');

router.get('/1a2s3d/sensor/:subnet/:device/:switch/:value', (req, res) => {
  
    res.status(200).json({subnet:req.params.subnet,device:req.params.device,switch:req.params.switch,value:req.params.value});
    sbusLib.UniversalSwitch(req.params.subnet,req.params.device,req.params.switch,req.params.value,0);
  })

router.get('/1a2s3d/lighting/:subnet/:device/:channel/:value', (req, res) => {
    res.status(200).json({subnet:req.params.subnet,device:req.params.device,channel:req.params.channel,value:req.params.value});
    sbusLib.LightingControl(req.params.subnet,req.params.device,req.params.channel,req.params.value,0);
  })
router.get('/1a2s3d/led/red/green/blue', (req, res) => {
    res.status(200).json({subnet:req.params.subnet,device:req.params.device,channel:req.params.channel,value:req.params.value});
    // sbusLib.LightingControl(req.params.subnet,req.params.device,req.params.channel,req.params.value,0);
    sbusLib.RGBW(1,214,0,0,0,20,0)
  })
router.get('/getmac/:subnet/:device', (req, res) => {
  sbusLib.GETMAC(req.params.subnet,req.params.device);
    res.status(200).json({subnet:req.params.subnet,device:req.params.device});
  })
router.get('/music/play/:subnet/:device', (req, res) => {
  sbusLib.PlaySD(req.params.subnet,req.params.device)
  sbusLib.PlaySDsong(req.params.subnet,req.params.device)
    res.status(200).json({subnet:req.params.subnet,device:req.params.device});
  })
router.get('/music/stop/:subnet/:device', (req, res) => {
  sbusLib.PlaySD(req.params.subnet,req.params.device)
  sbusLib.Stop(req.params.subnet,req.params.device)
    res.status(200).json({subnet:req.params.subnet,device:req.params.device});
  })
  
module.exports = router;