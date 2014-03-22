var getPublicIP = require('./publicIP');
var nssocket = require('nssocket');
var _ = require('underscore');
var events = require("events");
var util = require('util');


module.exports = (function () {
  function Node(port) {
    events.EventEmitter.call(this);
    this.nsclient = new nssocket.NsSocket();
    this.nodes = {};
    this.sortedIds = [];
    
    var thisNode = this;
    
    this.nsclient.data('id', function (id) {
      this.id = id;
      getPublicIP(function (ip) {
        if (ip) {
          this.nsclient.send('ip', ip, port);
        }
        else {
          this.nsclient.send('ip');
        }
      }.bind(this));
    }.bind(this));
    
    this.nsclient.data('node::offline', function (nodeId) {      
      delete thisNode.nodes[nodeId];
      thisNode.sortedIds = _.without(thisNode.sortedIds, nodeId);
      thisNode.emit('node::offline', nodeId);
    })
    
    this.nsclient.data('online', function (node) {
      if (this.id === node.id) {
        //console.log('I am online', node.id);
        this.emit('online');
      }
      else {
        //console.log('Someone online:', node.id);
        thisNode.sortedIds.push(node.id);
        this.nodes[node.id] = node;
        this.emit('node::online', node);
      }
    }.bind(this));
    
    this.nsclient.data('node::list', function (nodes) {
      _.extend(this.nodes, nodes);
      thisNode.sortedIds = _.keys(nodes);
    }.bind(this));
    
    this.nsclient.data('node::data', function (info) {
      if (info.eventName in ['online']) return;
      this.emit('node::' + info.eventName, info.sender, info.data);
    }.bind(this));
  }
  util.inherits(Node, events.EventEmitter);
  Node.prototype.connect = function (seed) {
    this.nsclient.connect(seed[0].host, seed[0].port);
  }
  
  Node.prototype.send = function (target, eventName, data) {
    this.nsclient.send('node::send', {
      target: target, 
      eventName: eventName,
      data: data
    });
  };
  
  Node.prototype.broadcast = function (eventName, data) {
    for (var id in this.nodes) {
      this.send(id, eventName, data);
    }
  }

  return Node;
})();
