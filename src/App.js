import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Home from './views/Home';
import Game from './views/Game';
import './App.css';

function App() {
  return (
    <Router>
      <h1>Battleship</h1>
      <Switch>
        <Route path='/game/:slug' component={Game} />
        <Route path='/' component={Home} />
      </Switch>
    </Router>
  );
}

export default App;
