const express = require('express');
const app = express();
const port = 3000;

app.use(function (req, res, next) {
  var data = "";
  req.on('data', function (chunk) {
    data += chunk
  })
  req.on('end', function () {
    if (data) {
      req.rawBody = data;
      req.jsonBody = JSON.parse(req.rawBody);
    }
    next();
  })
})

app.use(express.static(`${__dirname}/client`)); // statics
require(`./server/routes.js`)(app); // routes

app.listen(port); // let the games begin!
console.log(`Web server listening on port ${port}`);