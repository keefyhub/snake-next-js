'use client';

import { useRef, useEffect, useState } from "react";
let interval: any;

export function Game() {
  // States
  const [gameOver, setGameOver] = useState(false);
  const [difficulty, setDifficulty] = useState(250); // normal difficulty
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [velocity, setVelocity] = useState({
    x: 0,
    y: 0
  });
  const [snakePosition, setSnakePosition] = useState({
    x: 15,
    y: 15
  });
  const [foodPosition, setFoodPosition] = useState({
    x: 0,
    y: 0
  });
  const [snake, setSnake] = useState<Array<any>[any]>([snakePosition]);

  // Refs
  const playBoard = useRef(null);
  const scoreElement = useRef(null);
  const highScoreElement = useRef(null);
  const controls = useRef(null);
  const velocityRef = useRef(null);

  const changeDirection = (e: any) => {
    // NOTE - need to figure out why `velocity` doesnt work here, had to pass in values using `useRef`
    let velocityXY;

    // Stops the snake from going the opposite direction
    if (velocityRef.current) {
      const element = velocityRef.current as HTMLElement;
      velocityXY = JSON.parse(element.dataset.velocity as string);
    }

    // Changing velocity value based on key press
    if (e.key === "ArrowUp" && velocityXY.y !== 1) {
      setVelocity({
        x: 0,
        y: -1
      })
    } else if (e.key === "ArrowDown" && velocityXY.y !== -1) {
      setVelocity({
        x: 0,
        y: 1
      })
    } else if (e.key === "ArrowLeft" && velocityXY.x !== 1) {
      setVelocity({
        x: -1,
        y: 0
      })
    } else if (e.key === "ArrowRight" && velocityXY.x !== -1) {
      setVelocity({
        x: 1,
        y: 0
      })
    }
  }

  const handleDirectionClick = (e: MouseEvent) => {
    e.preventDefault();
    const targetElement = e.currentTarget as any;
    changeDirection({ key: targetElement.dataset.key })
  }

  const updateFoodPosition = () => {
    setFoodPosition(generateRandomPosition())
  }

  // Board size is 30x30
  const generateRandomPosition = () => {
    return {
      x: (Math.floor(Math.random() * 30) + 1),
      y: (Math.floor(Math.random() * 30) + 1)
    }
  }

  // Clearing the timer and reloading the page on game over
  const handleGameOver = () => {
    clearInterval(interval);
    alert("Game Over! Press OK to replay...");
    location.reload();
  }

  const GameBoard = () => {
    return (
      <div className="grid grid-cols-game-layout grid-rows-game-layout h-full" ref={playBoard}>
        <div className={`food col-start-${foodPosition.x} row-start-${foodPosition.y}`}></div>
        {snake.map((item: any, index: number) => (
          <SnakeBody key={index} props={{ item: item, key: index }} />
        ))}
      </div>
    )
  }

  const SnakeBody = ({ props }: any) => {
    return (
      <div className={`${props.key === 0 ? 'snake-head' : ''} snake-body col-start-${props.item.x} row-start-${props.item.y}`}></div>
    );
  }

  function gameInit() {
    if (gameOver) return handleGameOver();
    console.log('game running');
    let newSnake = snake;

    // If body touches food
    if (snakePosition.x === foodPosition.x && snakePosition.y === foodPosition.y) {
      updateFoodPosition();

      newSnake = [...snake, {
        x: foodPosition.y,
        y: foodPosition.x
      }];

      // Update score/highScore
      setScore(score + 1);
      const newHighScore = score + 1 >= highScore ? score + 1 : highScore;
      localStorage.setItem('highScore', JSON.stringify(newHighScore));
      setHighScore(newHighScore)
    }

    // Update head position
    setSnakePosition((prevState) => ({
      x: prevState.x + velocity.x,
      y: prevState.y + velocity.y,
    }));

    // Shift the body parts one by one
    for (let i = newSnake.length - 1; i > 0; i--) {
      newSnake[i] = newSnake[i - 1];
    }

    // Set the first body element position
    newSnake[0] = {
      x: snake[0].x + velocity.x,
      y: snake[0].y + velocity.y,
    };

    // Checking if the snake's head is out of wall, set gameOver to true
    if (snakePosition.x <= 0 || snakePosition.x > 30 || snakePosition.y <= 0 || snakePosition.y > 30) {
      setGameOver(true);
    }

    // Checking if the snake head hit the body, set gameOver to true
    for (let i = 0; i < newSnake.length; i++) {
      if (i !== 0 && newSnake[0].y === newSnake[i].y && newSnake[0].x === newSnake[i].x) {
        setGameOver(true);
      }
    }

    setSnake(newSnake);
  }

  useEffect(() => {
    // Set foods starting point on load
    setFoodPosition(generateRandomPosition());

    window.addEventListener('keydown', (e: KeyboardEvent) => { changeDirection(e) });

    return () => {
      window.removeEventListener('keydown', (e: KeyboardEvent) => { });
    }
  }, []);

  useEffect(() => {
    const highScore = JSON.parse(localStorage.getItem('highScore') ?? '0');

    if (highScore) {
      setHighScore(highScore);
    }
  }, [highScore]);

  useEffect(() => {
    interval = setInterval(() => {
      gameInit();
    }, difficulty);

    return () => {
      clearInterval(interval);
    }
  }, [velocity, snakePosition, gameOver]);

  return (
    <div className="aspect-square max-w-6xl min-h-96 rounded bg-elephant flex flex-col">
      <div ref={velocityRef} data-velocity={JSON.stringify(velocity)} />
      <div className="bg-midnight-express flex justify-between p-4">
        <div className="">
          <select
            className="bg-midnight-express rounded-none"
            onChange={e => setDifficulty(Number(e.target.value))}
          >
            <option value={500}>Easy</option>
            <option value={250} defaultValue="true">Normal</option>
            <option value={120}>Hard</option>
          </select>
        </div>
        <div className="">Score: <span ref={scoreElement}>{score}</span></div>
        <div className="">High Score: <span ref={highScoreElement}>{highScore}</span></div>
      </div>
      <GameBoard />
      <div className="flex md:hidden" ref={controls}>
        <button
          data-key="ArrowLeft"
          className="flex-1 py-4 px-2 text-center"
          onClick={(e: any) => handleDirectionClick(e)}
        >
          <span>&#8592;</span>
        </button>
        <button
          data-key="ArrowUp"
          className="flex-1 py-4 px-2 text-center"
          onClick={(e: any) => handleDirectionClick(e)}
        >
          <span>&#8593;</span>
        </button>
        <button
          data-key="ArrowRight"
          className="flex-1 py-4 px-2 text-center"
          onClick={(e: any) => handleDirectionClick(e)}
        >
          <span>&#8594;</span>
        </button>
        <button
          data-key="ArrowDown"
          className="flex-1 py-4 px-2 text-center"
          onClick={(e: any) => handleDirectionClick(e)}
        >
          <span>&#8595;</span>
        </button>
      </div>
    </div>
  );
}

