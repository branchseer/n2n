var Node = require('../').Node;

var node = new Node(4321);

node.connect([{ host: 'localhost', port: 6785 }]);

node.on('online', function () {
  console.log('I am online:', this.id);
});

node.on('node::online', function (newNode) {
  console.log('Someone is online:', newNode.id);
  node.send(newNode.id, 'hello');
});

node.on('node::hello', function (senderId) {
  console.log('Hello from', senderId);
});
