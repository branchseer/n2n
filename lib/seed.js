var nssocket = require('nssocket');
var uuid = require('node-uuid');
var _ = require('underscore');
var events = require("events");
var util = require('util');

var toArray = function (args) {
  return Array.prototype.slice.apply(args);
}

module.exports = (function () {
  function Seed() {
    events.EventEmitter.call(this);

    this.nodes = {};
    this.sockets = {};
    
    this.nsserver = nssocket.createServer(function (socket) {
      var nodeId = uuid.v1();
      var nodeInfo = {
        id: nodeId
      }
    
      this.sockets[nodeId] = socket;
      this.nodes[nodeId] = nodeInfo;
      socket.send('id', nodeId);
    
      socket.on('close', function (data) {
        delete this.nodes[nodeId];
        delete this.sockets[nodeId];
        this.broadcast('node::offline', nodeId);
      }.bind(this));
      
      socket.data('ip', function (ip, port) {
        
        if (ip) {
          nodeInfo.ip = ip;
          nodeInfo.port = port;
        }
        socket.send('node::list', this.nodes);
        this.broadcast('online', nodeInfo);
        
      }.bind(this));
      
      socket.data('node::send', function (info) {
        this.sockets[info.target].send('node::data', {
          sender: nodeId,
          eventName: info.eventName,
          data: info.data
        });
      }.bind(this));
      
    }.bind(this));
  }
  util.inherits(Seed, events.EventEmitter);

  
  Seed.prototype.listen = function () {
    this.nsserver.listen.apply(this.nsserver, Array.prototype.slice.apply(arguments));
  }
  
  Seed.prototype.broadcast = function () {
    /*
    var nodes = _.chain(this.nodes).values();
    nodes.invoke.apply(nodes, ['send'].concat(toArray(arguments)));
    */
    var socket;
    for (var id in this.sockets) {
      socket = this.sockets[id];
      socket.send.apply(socket, arguments);
    }
  }
  
  return Seed;
})();

/*
var seed = new Seed();

seed.listen(6785);

var outbound = new nssocket.NsSocket();
outbound.data('id', function (uuid) {
  console.log(uuid);
  outbound.send('ip');
});
outbound.data('online', function (id) {
  console.log('someone online:', id);
})
outbound.connect('localhost', 6785);
*/