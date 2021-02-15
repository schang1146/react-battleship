import { useEffect, useRef, useState } from 'react';
import pusher from '../pusher';
import GameMap from '../components/GameMap';

export default function Game(props) {
  const presenceChannel = useRef();
  const player1 = useRef('');
  const player2 = useRef('');
  const [yourShips, setYourShips] = useState([]);
  const [opponentShips, setOpponentShips] = useState([]);
  const [yourGuesses, setYourGuesses] = useState(new Set());
  const [opponentGuesses, setOpponentGuesses] = useState(new Set());
  const [gameStatus, setGameStatus] = useState('Place your pieces...');

  useEffect(() => {
    const channel = pusher.subscribe(`presence-${props.match.params.slug}`);

    channel.bind('pusher:subscription_succeeded', (members) => {
      console.log('subscription_succeeded');
      if (members.count === 1) {
        player1.current = members.me.id;
      }
      if (members.count === 2) {
        for (let member of Object.keys(members.members)) {
          if (member !== members.me.id) {
            player1.current = member;
          }
        }
        player2.current = members.me.id;
      }
    });

    channel.bind('pusher:member_added', (member) => {
      console.log('member_added', member);
      if (player2.current === '') {
        player2.current = member.id;
      }
    });

    channel.bind('pusher:member_removed', (member) => {
      console.log('member_removed', member);
    });

    channel.bind('client-send_guess', (data) => {
      console.log('client-send_guess', data);
      setOpponentGuesses((oldGuesses) => new Set([...oldGuesses, `${data.x},${data.y}`]));
    });

    channel.bind('client-send_ships', (data) => {
      console.log('client-send_ships', data);
      setOpponentShips(data.ships);
    });

    channel.bind('client-send_status', (data) => {
      console.log('client-send_status', data);
      console.log(presenceChannel.current);
      if (data.status === 'Ready') {
        console.log('Opponent is ready!');
      } else if (data.status === 'Game Started') {
        setGameStatus('Game Started');
      }
    });

    presenceChannel.current = channel;

    return () => {
      presenceChannel.current = null;
    };
  }, [props.match.params.slug]);

  return (
    <div>
      <GameMap presenceChannel={presenceChannel} gameStatus={gameStatus} setGameStatus={setGameStatus} player1={player1.current} player2={player2.current} setYourGuesses={setYourGuesses} yourGuesses={yourGuesses} opponentGuesses={opponentGuesses} setYourShips={setYourShips} yourShips={yourShips} opponentShips={opponentShips} />
      <button onClick={() => console.log(`Player1: ${player1.current}\nPlayer2: ${player2.current}`)}>Debug Players</button>
      <button onClick={() => console.log(presenceChannel.current)}>Debug Log presenceChannel</button>
    </div>
  );
}
