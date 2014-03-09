var getPublicIP = require('../lib/publicIP');

getPublicIP(function (ip) {
  if (ip) {
    console.log(ip);
  }
  else {
    console.log('no public ip');
  }
});
