import { Link } from 'react-router-dom';

export default function Home() {
  const generateSlug = () => {
    return Math.random().toString(36).substring(2, 15);
  };

  return (
    <div>
      <Link
        to={{
          pathname: '/game/' + generateSlug(),
          state: { fromHome: true },
        }}
      >
        New Game
      </Link>
    </div>
  );
}
