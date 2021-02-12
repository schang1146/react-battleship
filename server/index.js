require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const crypto = require('crypto');
const Pusher = require('pusher');

const pusher = new Pusher({
  appId: process.env.PUSHER_CHANNELS_APP_ID,
  key: process.env.PUSHER_CHANNELS_KEY,
  secret: process.env.PUSHER_CHANNELS_SECRET,
  cluster: process.env.PUSHER_CHANNELS_CLUSTER,
  useTLS: true,
});

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors());

app.get('/', (req, res) => {
  res.send('Server is up and running!');
});

app.post('/pusher/auth', (req, res) => {
  const socketId = req.body.socket_id;
  const channel = req.body.channel_name;
  const presenceData = {
    user_id: crypto.randomBytes(16).toString('hex'),
  };

  const auth = pusher.authenticate(socketId, channel, presenceData);
  res.send(auth);
});

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});
