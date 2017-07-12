//npm install springedge

var springedge = require('springedge');

var params = {
  'apikey': 'xxxxxxxxxxxxxxxxx', //API Key
  'sender': 'SEDEMO', //Test Sender
  'to': [
    '9190xxxxxxxx'  //Mobile Numberss
  ],
  'message': 'test message from node js'
};

springedge.messages.send(params, 5000, function (err, response) {
  if (err) {
    return console.log(err);
  }
  console.log(response);
});
