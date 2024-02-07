'use client';

import { useRef, useEffect, useState } from "react";
let interval: any;
let speed = 60;

export function Game() {
  // States
  const [gameOver, setGameOver] = useState(false);
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
    x: (Math.floor(Math.random() * 30) + 1),
    y: (Math.floor(Math.random() * 30) + 1)
  });
  const [snake, setSnake] = useState<Array<any>[any]>([{
    x: 15,
    y: 15
  }]);

  // Refs
  const playBoard = useRef(null);
  const scoreElement = useRef(null);
  const highScoreElement = useRef(null);
  const controls = useRef(null);
  const velocityRef = useRef(null);

  const changeDirection = (e: any) => {
    let velcoityX, velcoityY;

    // NOTE - need to figure out why `velocity` doesnt work here, had to pass in values using `useRef`
    // Stops the snake from going the opposite direction
    if (velocityRef.current) {
      const element = velocityRef.current as HTMLElement;
      velcoityX = Number(element.getAttribute('data-attr-x'));
      velcoityY = Number(element.getAttribute('data-attr-y'));
    }

    // Changing velocity value based on key press
    if (e.key === "ArrowUp" && velcoityY !== 1) {
      setVelocity({
        x: 0,
        y: -1
      })
    } else if (e.key === "ArrowDown" && velcoityY !== -1) {
      setVelocity({
        x: 0,
        y: 1
      })
    } else if (e.key === "ArrowLeft" && velcoityX !== 1) {
      setVelocity({
        x: -1,
        y: 0
      })
    } else if (e.key === "ArrowRight" && velcoityX !== -1) {
      setVelocity({
        x: 1,
        y: 0
      })
    }
  }

  const updateFoodPosition = () => {
    // Passing a random 1 - 30 value as food position
    setFoodPosition({
      x: (Math.floor(Math.random() * 30) + 1),
      y: (Math.floor(Math.random() * 30) + 1)
    })
  }

  const handleGameOver = () => {
    // Clearing the timer and reloading the page on game over
    clearInterval(interval);
    alert("Game Over! Press OK to replay...");
    location.reload();
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

    for (let i = newSnake.length - 1; i > 0; i--) {
      newSnake[i] = newSnake[i - 1];
    }

    newSnake[0] = {
      x: snake[0].x + velocity.x,
      y: snake[0].y + velocity.y,
    };

    // Checking if the snake's head is out of wall, if so setting gameOver to true
    if (snakePosition.x <= 0 || snakePosition.x > 30 || snakePosition.y <= 0 || snakePosition.y > 30) {
      setGameOver(true);
    }

    // Checking if the snake head hit the body, if so set gameOver to true
    for (let i = 0; i < newSnake.length; i++) {
      if (i !== 0 && newSnake[0].y === newSnake[i].y && newSnake[0].x === newSnake[i].x) {
        setGameOver(true);
      }
    }

    // Only set state once due to issues with async setState
    setSnake(newSnake);
  }

  const handleDirectionClick = (e: MouseEvent) => {
    e.preventDefault();
    const targetElement = e.currentTarget as any;
    changeDirection({ key: targetElement.dataset.key })
  }

  // Maybe move this into its own component
  const GameBoard = () => {
    return (
      <div className="grid grid-cols-game-layout grid-rows-game-layout h-full" ref={playBoard}>
        <div className={`food col-start-${foodPosition.x} row-start-${foodPosition.y}`}></div>
        {snake.map((item: any, index: number) => (
          <SnakeBody key={index} props={item} />
        ))}
      </div>
    )
  }

  const SnakeBody = (snakeBody: any, index: number) => {
    return (
      <>
        <div key={index} className={`snake-body col-start-${snakeBody.props.x} row-start-${snakeBody.props.y}`}></div>
      </>
    );
  }

  useEffect(() => {
    window.addEventListener('keydown', (e: KeyboardEvent) => { changeDirection(e) });

    return () => {
      window.removeEventListener('keydown', (e: KeyboardEvent) => { changeDirection(e) });
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
    }, speed);

    return () => {
      clearInterval(interval);
    }
  }, [velocity, snakePosition, gameOver]);

  return (
    <div className="aspect-square max-w-6xl min-h-96 rounded bg-elephant flex flex-col">
      <div ref={velocityRef} data-attr-x={velocity.x} data-attr-y={velocity.y} />
      <div className="bg-midnight-express flex justify-between p-4">
        <span className="">Score: <span ref={scoreElement}>{score}</span></span>
        <span className="">High Score: <span ref={highScoreElement}>{highScore}</span></span>
      </div>
      <GameBoard />
      <div className="flex md:hidden" ref={controls}>
        <button
          data-key="ArrowLeft"
          className="flex-1 py-4 px-2 text-center"
          onClick={(e: any) => handleDirectionClick(e)}
        >
          <span>Left</span>
        </button>
        <button
          data-key="ArrowUp"
          className="flex-1 py-4 px-2 text-center"
          onClick={(e: any) => handleDirectionClick(e)}
        >
          <span>Up</span>
        </button>
        <button
          data-key="ArrowRight"
          className="flex-1 py-4 px-2 text-center"
          onClick={(e: any) => handleDirectionClick(e)}
        >
          <span>Right</span>
        </button>
        <button
          data-key="ArrowDown"
          className="flex-1 py-4 px-2 text-center"
          onClick={(e: any) => handleDirectionClick(e)}
        >
          <span>Down</span>
        </button>
      </div>
    </div>
  );
}

