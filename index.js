var express = require('express');
var bodyParser = require('body-parser');
var app = express();

const VERIFY_TOKEN = "abc";
const PAGE_TOKEN = "abc";

app.set('port', (process.env.PORT || 5000));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(__dirname + '/public'));

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.get('/test', function(request, response) {
  response.send('Just for test');
});

app.get('/', function(request, response) {
  response.render('pages/index');
});

app.get('/webhook/', (req, res) => {
  if (req.query['hub.verify_token'] === VERIFY_TOKEN) {
    res.send(req.query['hub.challenge']);
  }
  res.send('Error, wrong validation token');
});

app.post('/webhook/', (req, res) => {

  console.log(req.body);

  const messaging_events = req.body.entry[0].messaging;
  for (let i = 0; i < messaging_events.length; i++) {
    const event = req.body.entry[0].messaging[i];
    const sender = event.sender.id;
    if (event.message && event.message.text) {
      const text = event.message.text;
      sendTextMessage(sender, "Text received, echo: "+ text.substring(0, 200));
    }
  }
  res.sendStatus(200);
});

function sendTextMessage(sender, text) {
  
  const messageData = {
    text: text
  }

  request({
    url: 'https://graph.facebook.com/v2.6/me/messages',
    qs: {
        access_token:PAGE_TOKEN
    },
    method: 'POST',
    json: {
      recipient: {
        id: sender
      },
      message: messageData,
    }
  }, function(error, response, body) {
    if (error) {
      console.log('Error sending message: ', error);
    } else if (response.body.error) {
      console.log('Error: ', response.body.error);
    }
  });
}

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});




