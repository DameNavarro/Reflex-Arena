import React, { useState, useEffect, useRef } from 'react';

const ReactionTimeGame = () => {
  const [gameState, setGameState] = useState('ready'); // ready, waiting, clicked, results
  const [startTime, setStartTime] = useState(0);
  const [reactionTime, setReactionTime] = useState(null);
  const [countdown, setCountdown] = useState(3);
  const [results, setResults] = useState([]);
  const [bestTime, setBestTime] = useState(null);
  const timerRef = useRef(null);
  const waitTimeRef = useRef(null);

  // Colors
  const bgColors = {
    ready: 'bg-gray-800',
    waiting: 'bg-red-600',
    go: 'bg-green-500',
    tooEarly: 'bg-yellow-500'
  };

  // Start the game
  const startGame = () => {
    setGameState('countdown');
    setCountdown(3);
    
    const countdownInterval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          setWaitingState();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Set up the waiting state where user needs to wait for green
  const setWaitingState = () => {
    setGameState('waiting');
    // Random wait time between 1.5 and 4 seconds
    const waitTime = Math.floor(Math.random() * 2500) + 1500;
    waitTimeRef.current = setTimeout(() => {
      setGameState('go');
      setStartTime(Date.now());
    }, waitTime);
  };

  // Handle click during the game
  const handleClick = () => {
    if (gameState === 'ready' || gameState === 'results') {
      startGame();
    } else if (gameState === 'waiting') {
      // Clicked too early!
      clearTimeout(waitTimeRef.current);
      setGameState('tooEarly');
      setTimeout(() => {
        setGameState('ready');
      }, 1500);
    } else if (gameState === 'go') {
      const endTime = Date.now();
      const time = endTime - startTime;
      setReactionTime(time);
      
      // Update results
      const newResults = [...results, time].slice(-5); // Keep last 5 results
      setResults(newResults);
      
      // Update best time
      if (bestTime === null || time < bestTime) {
        setBestTime(time);
      }
      
      setGameState('results');
    }
  };

  // Get average time from results
  const getAverageTime = () => {
    if (results.length === 0) return 0;
    const sum = results.reduce((acc, time) => acc + time, 0);
    return Math.round(sum / results.length);
  };

  // Get reaction time rating
  const getReactionRating = (time) => {
    if (time < 200) return "Incredible!";
    if (time < 250) return "Amazing!";
    if (time < 300) return "Excellent!";
    if (time < 350) return "Very Good";
    if (time < 400) return "Good";
    if (time < 450) return "Above Average";
    if (time < 500) return "Average";
    return "Keep practicing!";
  };

  return (
    <div className="w-full max-w-md mx-auto p-4 flex flex-col items-center">
      <h1 className="text-2xl font-bold mb-6">Reaction Time Test</h1>
      
      <div 
        className={`w-full h-64 rounded-lg flex items-center justify-center cursor-pointer mb-4 transition-colors duration-200 ${
          gameState === 'go' ? bgColors.go : 
          gameState === 'waiting' ? bgColors.waiting : 
          gameState === 'tooEarly' ? bgColors.tooEarly : 
          bgColors.ready
        }`}
        onClick={handleClick}
      >
        <div className="text-white text-xl font-bold text-center p-4">
          {gameState === 'ready' && "Click to start"}
          {gameState === 'countdown' && `Get ready... ${countdown}`}
          {gameState === 'waiting' && "Wait for green..."}
          {gameState === 'go' && "CLICK NOW!"}
          {gameState === 'tooEarly' && "Too early! Try again."}
          {gameState === 'results' && (
            <div>
              <div className="text-3xl mb-2">{reactionTime} ms</div>
              <div>{getReactionRating(reactionTime)}</div>
              <div className="mt-4 text-base">Click to try again</div>
            </div>
          )}
        </div>
      </div>
      
      <div className="w-full bg-gray-700 rounded-lg p-4 text-white">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <h2 className="font-bold">Best Time</h2>
            <p>{bestTime ? `${bestTime} ms` : "Not set"}</p>
          </div>
          <div>
            <h2 className="font-bold">Average (last 5)</h2>
            <p>{results.length > 0 ? `${getAverageTime()} ms` : "Not set"}</p>
          </div>
        </div>
        
        {results.length > 0 && (
          <div className="mt-4">
            <h2 className="font-bold mb-2">Recent Results</h2>
            <div className="grid grid-cols-5 gap-1">
              {results.map((time, index) => (
                <div key={index} className="text-center text-sm">
                  {time} ms
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      <div className="mt-6 text-sm text-gray-500">
        <p>Click when the box turns green. Try to get the fastest time!</p>
      </div>
    </div>
  );
};

export default ReactionTimeGame;
