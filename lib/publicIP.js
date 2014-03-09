var os = require('os');
var request = require('request');
var _ = require('underscore');

var getMyIPs = function () {
  return _.chain(os.networkInterfaces())
    .values()
    .flatten()
    .pluck('address')
    .value();
}

module.exports = function (cb) {
  if (!cb) return;

  return process.nextTick(function () {
    return cb(false);
  });

  request('http://what-is-my-ip.net/?text', function (error, response, body) {
    if (error) {
      return cb(null);
    }
    
    if (_.contains(getMyIPs(), body)) {
      return cb(body);
    }

    return cb(false);
  });
};
