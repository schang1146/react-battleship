import { useEffect, useRef, useState } from 'react';

export default function GameMap(props) {
  const yourRef = useRef();
  const opponentRef = useRef();
  const [canvasSize, setCanvasSize] = useState(600);
  const [gameStatus, setGameStatus] = useState('Placing your pieces...');
  const [newShip, setNewShip] = useState(new Set());

  useEffect(() => {
    if (gameStatus === 'Placing your pieces...') {
      const yourCanvas = yourRef.current;
      yourCanvas.addEventListener('mousedown', handlerMouseDown);
      yourCanvas.addEventListener('mousemove', handlerMouseMove);
      yourCanvas.addEventListener('mouseup', handlerMouseUp);
    }
  }, [gameStatus]);

  useEffect(() => {
    const yourCanvas = yourRef.current;
    const opponentCanvas = opponentRef.current;

    drawHeaders(yourRef.current);
    drawShips(yourRef.current, props.yourShips);
    for (let guess of props.opponentGuesses) {
      const [xString, yString] = guess.split(',');
      const x = parseInt(xString);
      const y = parseInt(yString);
      if (checkGuess(x, y)) {
        drawHit(yourRef.current, x, y);
      } else {
        drawMiss(yourRef.current, x, y);
      }
    }
    drawGrid(yourRef.current);

    drawHeaders(opponentRef.current);
    for (let guess of props.yourGuesses) {
      const [xString, yString] = guess.split(',');
      const x = parseInt(xString);
      const y = parseInt(yString);
      if (checkGuess(x, y)) {
        drawHit(opponentRef.current, x, y);
      } else {
        drawMiss(opponentRef.current, x, y);
      }
    }
    drawGrid(opponentRef.current);

    opponentCanvas.addEventListener('click', handlerClick);

    return () => {
      clear(yourCanvas);
      clear(opponentCanvas);
      opponentCanvas.removeEventListener('click', handlerClick);
    };
  });

  const checkGuess = (x, y) => {
    for (let ship of props.opponentShips) {
      if (x >= ship.coordinates[0][0] && x <= ship.coordinates[1][0]) {
        if (y >= ship.coordinates[0][1] && y <= ship.coordinates[1][1]) {
          return true;
        }
      }
    }
    return false;
  };

  const clear = (canvas) => {
    const ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, canvasSize, canvasSize);
  };

  const drawGrid = (canvas) => {
    const ctx = canvas.getContext('2d');

    const gridSize = canvasSize / 11;

    ctx.strokeStyle = '#252525';
    ctx.lineWidth = 1;

    for (let x = gridSize; x < canvasSize; x += gridSize) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvasSize);
      ctx.stroke();
    }

    for (let y = gridSize; y < canvasSize; y += gridSize) {
      ctx.moveTo(0, y);
      ctx.lineTo(canvasSize, y);
      ctx.stroke();
    }
  };

  const drawHeaders = (canvas) => {
    const ctx = canvas.getContext('2d');

    const gridSize = canvasSize / 11;
    const header = {
      letters: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'],
      numbers: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    };

    ctx.font = `${canvasSize / 20}px Courier New`;
    ctx.strokeStyle = '#252525';
    ctx.lineWidth = 1;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    for (let i = 0; i < 10; i++) {
      const offset = (gridSize * 3) / 2 + gridSize * i;
      ctx.strokeText(header.letters[i], offset, gridSize / 2);
      ctx.strokeText(header.numbers[i], gridSize / 2, offset);
    }
  };

  const drawHit = (canvas, x, y) => {
    const ctx = canvas.getContext('2d');

    const gridSize = canvasSize / 11;
    const offset = gridSize / 10;

    ctx.beginPath();
    ctx.strokeStyle = '#FF0000';
    ctx.lineWidth = 3;

    const topleft = [(x + 1) * gridSize + offset, (y + 1) * gridSize + offset];
    const topright = [(x + 2) * gridSize - offset, (y + 1) * gridSize + offset];
    const botleft = [(x + 1) * gridSize + offset, (y + 2) * gridSize - offset];
    const botright = [(x + 2) * gridSize - offset, (y + 2) * gridSize - offset];

    ctx.moveTo(topleft[0], topleft[1]);
    ctx.lineTo(botright[0], botright[1]);
    ctx.stroke();
    ctx.moveTo(botleft[0], botleft[1]);
    ctx.lineTo(topright[0], topright[1]);
    ctx.stroke();
    ctx.closePath();
  };

  const drawMiss = (canvas, x, y) => {
    const ctx = canvas.getContext('2d');

    const gridSize = canvasSize / 11;
    const offset = gridSize / 10;
    const radius = (gridSize - 2 * offset) / 2 / 6;
    const center = [(x + 3 / 2) * gridSize, (y + 3 / 2) * gridSize];

    ctx.beginPath();
    ctx.fillStyle = '#252525';
    ctx.strokeStyle = '#252525';
    ctx.lineWidth = 1;
    ctx.arc(center[0], center[1], radius, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();
  };

  const drawShips = (canvas, ships) => {
    const ctx = canvas.getContext('2d');

    const gridSize = canvasSize / 11;
    const offset = gridSize / 10;

    ctx.fillStyle = '#D9D9D9';
    ctx.strokeStyle = '#050505';

    for (let ship of ships) {
      const coord1 = ship.coordinates[0];
      const coord2 = ship.coordinates[1];

      const topleft = [Math.min(coord1[0], coord2[0]) * gridSize + gridSize + offset, Math.min(coord1[1], coord2[1]) * gridSize + gridSize + offset];
      const width = (Math.abs(coord1[0] - coord2[0]) + 1) * gridSize - 2 * offset;
      const height = (Math.abs(coord1[1] - coord2[1]) + 1) * gridSize - 2 * offset;

      ctx.fillRect(topleft[0], topleft[1], width, height);

      ctx.beginPath();
      ctx.rect(topleft[0], topleft[1], width, height);
      ctx.stroke();
    }
  };

  const handlerClick = (e) => {
    const gridSize = canvasSize / 11;
    const x = Math.floor((e.offsetX - gridSize) / gridSize);
    const y = Math.floor((e.offsetY - gridSize) / gridSize);

    props.presenceChannel.current.trigger('client-send_guess', { x: x, y: y });
    props.setYourGuesses((oldGuesses) => new Set([...oldGuesses, `${x},${y}`]));
  };
  const handlerMouseDown = (e) => {
    const gridSize = canvasSize / 11;
    const x = Math.floor((e.offsetX - gridSize) / gridSize);
    const y = Math.floor((e.offsetY - gridSize) / gridSize);

    setNewShip((coords) => new Set([...coords, `${x},${y}`]));
  };
  const handlerMouseMove = (e) => {
    const gridSize = canvasSize / 11;
    const x = Math.floor((e.offsetX - gridSize) / gridSize);
    const y = Math.floor((e.offsetY - gridSize) / gridSize);

    if (!newShip.has(`${x},${y}`)) {
      setNewShip((coords) => new Set([...coords, `${x},${y}`]));
    }
  };
  const handlerMouseUp = (e) => {
    // setYourShips()
  };
  const handlerReady = (e) => {
    setGameStatus('Ready, waiting on opponent...');
  };

  return (
    <div>
      <h2>GameMap</h2>
      <div>Game Status: {gameStatus}</div>
      <div style={{ display: 'flex-row' }}>
        <div style={{ width: '40%', display: 'inline-block' }}>
          <h3>Your Board</h3>
          <canvas id='canvas' ref={yourRef} width={`${canvasSize}px`} height={`${canvasSize}px`} style={{ border: '1px solid black' }} />
        </div>
        <div style={{ width: '40%', display: 'inline-block' }}>
          <h3>Opponent's Board</h3>
          <canvas id='opponent' ref={opponentRef} width={`${canvasSize}px`} height={`${canvasSize}px`} style={{ border: '1px solid black' }} />
        </div>
      </div>
      {gameStatus === 'Placing your pieces...' && <button onClick={handlerReady}>Ready</button>}
    </div>
  );
}
