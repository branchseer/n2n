#A Node.js P2P Network

##Starting a seed
One or several seed servers are required to bootstrap the network. To start a seed server listening 6785:   
```javascript
var Seed = require('n2n').Seed;

var seed = new Seed();
seed.listen(6785);
console.log('Seed listening 6785...');
```
##Starting a node
The following code snippet starts a node by connecting to the seed server `seed.com:6785`. If the node has a public IP, it will start a seed server listening 6785, as well.
```javascript
var Node = require('n2n').Node;
var node = new Node(6785);
node.connect([{ host: 'seed.com', port: 6785 }]);
```

Once the node gets online, the event `online` will be emitted.

```javascript
node.on('online', function () {
  console.log('I am online:', this.id);
});
```

Event `node::online` means another node gets online. A object representing the new node will be passed to event handlers:
```javascript
node.on('node::online', function (newNode) {
  console.log('Someone is online:', newNode.id);
});
```

##Communication
Nodes communicate via events.  
###Node#send(targetId:string, eventName:string, [data:*])
Emit a custom event called `eventName` on a specific node.
###Node#broadcast(eventName:string, [data:*])
Emit a custom event called `eventName` on all nodes online.

###Handling custom events
The name of custom events must be prefixed with `'node::'`. If any, event data will be passed to event handlers:
```javascript
node.on('node::hello', function (senderId) {
  console.log('Hello from', senderId);
});
```