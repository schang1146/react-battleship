import Pusher from 'pusher-js';

Pusher.logToConsole = true;

const pusher = new Pusher(process.env.REACT_APP_PUSHER_CHANNELS_KEY, {
  cluster: process.env.REACT_APP_PUSHER_CHANNELS_CLUSTER,
  forceTLS: true,
  authEndpoint: 'http://localhost:5000/pusher/auth',
});

export default pusher;
