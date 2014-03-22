var Node = require('../').Node;

var node = new Node(4321);

node.connect([{ host: 'localhost', port: 6785 }]);

node.on('online', function () {
  console.log('Online ids:', node.sortedIds);
  console.log('I am online:', this.id);
});

node.on('node::online', function (newNode) {
  console.log('Online ids:', node.sortedIds);
  console.log('Someone is online:', newNode.id);
  node.send(newNode.id, 'hello');
});

node.on('node::hello', function (senderId) {
  console.log('Hello from', senderId);
});

node.on('node::offline', function (offlineNodeId) {
  
  console.log('Online ids:', node.sortedIds);
  console.log('Someone is offline:', offlineNodeId);
});
