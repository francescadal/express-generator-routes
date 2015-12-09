//jshint node: true
//hello routes
'use strict';
var express = require('express');
var router = express.Router();

/* example routes */
router.get('/', function(req, res, next) {
  res.json({message: 'Hello, world!'});
});

router.get('/id', function(req, res, next) {
  res.json({message: 'Hello, '+ req.params.id + '!'})
});

module.exports = router;
