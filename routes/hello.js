var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  res.status(200).send('Hello, World!');
});

router.get('/:name', function(req, res, next) {
  res.status(200).send('Hello, ' + req.params.name + '!');
});

module.exports = router;
