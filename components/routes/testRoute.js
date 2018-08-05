var debug = require('debug')('botkit:oauth');

module.exports = function(webserver, controller) {

    webserver.get('/test', function(req, res) {
        res.status(200);
        res.send('test');
    });
}
