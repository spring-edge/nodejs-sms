//npm install springedge

var springedge = require('springedge')();

var params = {
  'apikey': '636n033l3549o14yp1ljdti3t81rk11v5', //TEST API Key
  'sender': 'SEDEMO', //Test Sender
  'to': [
    '919035732236'  //Test Numberss
  ],
  'body': 'test+message'
};

springedge.messages.send(params, function (err, response) {
  if (err) {
    return console.log(err);
  }
  console.log(response);
});
