var debug = require('debug')('botkit:oauth');

module.exports = function(webserver, controller) {
  webserver.get('/keepalive/', function(req, res) {
    res.send(200);
  });
}
