import { useEffect, useRef, useState } from 'react';
import pusher from '../pusher';
import GameMap from '../components/GameMap';

export default function Game(props) {
  const presenceChannel = useRef();
  const [yourShips, setYourShips] = useState([]);
  const [opponentShips, setOpponentShips] = useState([]);
  const [yourGuesses, setYourGuesses] = useState(new Set());
  const [opponentGuesses, setOpponentGuesses] = useState(new Set());

  useEffect(() => {
    const channel = pusher.subscribe(`presence-${props.match.params.slug}`);

    channel.bind('pusher:subscription_succeeded', (members) => {
      console.log('subscription_succeeded');
      console.log(members);
    });

    channel.bind('pusher:member_added', (member) => {
      console.log('member_added', member);
    });

    channel.bind('pusher:member_removed', (member) => {
      console.log('member_removed', member);
    });

    channel.bind('client-send_guess', (data) => {
      console.log('client-send_guess', data);
      setOpponentGuesses((oldGuesses) => new Set([...oldGuesses, `${data.x},${data.y}`]));
    });

    presenceChannel.current = channel;

    return () => {
      presenceChannel.current = null;
    };
  }, [props.match.params.slug]);

  return (
    <div>
      <GameMap presenceChannel={presenceChannel} setYourGuesses={setYourGuesses} yourGuesses={yourGuesses} opponentGuesses={opponentGuesses} setYourShips={setYourShips} yourShips={yourShips} opponentShips={opponentShips} />
    </div>
  );
}
