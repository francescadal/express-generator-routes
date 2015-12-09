var express = require('express');
var router = express.Router();
var strftime = require('strftime');

/* GET users listing. */
router.get('/', function(req, res, next) {
  var now = strftime('%F %H:%M');
  res.json({message: 'The current time is ' + now })
});

module.exports = router;
