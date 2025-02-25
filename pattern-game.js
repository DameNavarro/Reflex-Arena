import React, { useState, useEffect } from 'react';

const PatternGame = () => {
  const [pattern, setPattern] = useState([]);
  const [options, setOptions] = useState([]);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [difficulty, setDifficulty] = useState(1);

  // Generate a new pattern
  const generatePattern = () => {
    const patternLength = 3 + Math.floor(difficulty / 2);
    const newPattern = [];
    
    // Pattern types: 1 = number sequence, 2 = color sequence, 3 = shape sequence
    const patternType = Math.floor(Math.random() * 3) + 1;
    
    if (patternType === 1) {
      // Number sequence
      const start = Math.floor(Math.random() * 5) + 1;
      const step = Math.floor(Math.random() * 3) + 1;
      
      for (let i = 0; i < patternLength; i++) {
        newPattern.push({
          type: 'number',
          value: start + (i * step)
        });
      }
      
      // Set next value in sequence for correct answer
      const correctAnswer = {
        type: 'number',
        value: start + (patternLength * step)
      };
      
      // Generate wrong options
      const wrongOptions = [];
      while (wrongOptions.length < 3) {
        const wrongValue = start + (patternLength * step) + Math.floor(Math.random() * 5) - 2;
        if (wrongValue !== correctAnswer.value && !wrongOptions.includes(wrongValue)) {
          wrongOptions.push({
            type: 'number',
            value: wrongValue
          });
        }
      }
      
      setOptions(shuffleArray([correctAnswer, ...wrongOptions]));
    } else if (patternType === 2) {
      // Color sequence
      const colors = ['red', 'blue', 'green', 'yellow', 'purple', 'orange'];
      const colorIndices = [];
      
      // Create a pattern of color indices
      let lastIndex = Math.floor(Math.random() * colors.length);
      colorIndices.push(lastIndex);
      
      for (let i = 1; i < patternLength; i++) {
        // Simple pattern: rotate through colors with fixed step
        lastIndex = (lastIndex + 1 + Math.floor(Math.random() * 2)) % colors.length;
        colorIndices.push(lastIndex);
      }
      
      // Create pattern objects
      for (let i = 0; i < patternLength; i++) {
        newPattern.push({
          type: 'color',
          value: colors[colorIndices[i]]
        });
      }
      
      // Set next color in sequence for correct answer
      const nextColorIndex = (colorIndices[patternLength - 1] + 1 + Math.floor(Math.random() * 2)) % colors.length;
      const correctAnswer = {
        type: 'color',
        value: colors[nextColorIndex]
      };
      
      // Generate wrong options
      const wrongOptions = [];
      while (wrongOptions.length < 3) {
        const wrongIndex = Math.floor(Math.random() * colors.length);
        if (wrongIndex !== nextColorIndex && !wrongOptions.some(o => o.value === colors[wrongIndex])) {
          wrongOptions.push({
            type: 'color',
            value: colors[wrongIndex]
          });
        }
      }
      
      setOptions(shuffleArray([correctAnswer, ...wrongOptions]));
    } else {
      // Shape sequence
      const shapes = ['circle', 'square', 'triangle', 'diamond', 'hexagon', 'star'];
      const sequence = [];
      
      // Create a rotating pattern of shapes
      let currentIndex = Math.floor(Math.random() * shapes.length);
      for (let i = 0; i < patternLength; i++) {
        sequence.push(currentIndex);
        currentIndex = (currentIndex + 1) % shapes.length;
      }
      
      // Create pattern objects
      for (let i = 0; i < patternLength; i++) {
        newPattern.push({
          type: 'shape',
          value: shapes[sequence[i]]
        });
      }
      
      // Set next shape in sequence for correct answer
      const correctAnswer = {
        type: 'shape',
        value: shapes[sequence[patternLength - 1] === shapes.length - 1 ? 0 : sequence[patternLength - 1] + 1]
      };
      
      // Generate wrong options
      const wrongOptions = [];
      while (wrongOptions.length < 3) {
        const wrongIndex = Math.floor(Math.random() * shapes.length);
        if (shapes[wrongIndex] !== correctAnswer.value && !wrongOptions.some(o => o.value === shapes[wrongIndex])) {
          wrongOptions.push({
            type: 'shape',
            value: shapes[wrongIndex]
          });
        }
      }
      
      setOptions(shuffleArray([correctAnswer, ...wrongOptions]));
    }
    
    setPattern(newPattern);
  };

  // Shuffle array helper function
  const shuffleArray = (array) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  // Start a new game
  const startGame = () => {
    setScore(0);
    setTimeLeft(30);
    setGameOver(false);
    setDifficulty(1);
    generatePattern();
  };

  // Handle option selection
  const handleOptionSelect = (selectedOption) => {
    // Check if it's the correct next item in the pattern
    let isCorrect = false;
    
    if (pattern[0].type === 'number') {
      // For number sequences, check if it follows the arithmetic progression
      const diff = pattern[1].value - pattern[0].value;
      isCorrect = selectedOption.value === pattern[pattern.length - 1].value + diff;
    } else if (pattern[0].type === 'color' || pattern[0].type === 'shape') {
      // For colors and shapes, check if it follows the established pattern
      const lastItem = pattern[pattern.length - 1].value;
      const secondLastItem = pattern[pattern.length - 2].value;
      
      if (pattern[0].type === 'color') {
        const colors = ['red', 'blue', 'green', 'yellow', 'purple', 'orange'];
        const lastIndex = colors.indexOf(lastItem);
        const secondLastIndex = colors.indexOf(secondLastItem);
        const diff = (lastIndex - secondLastIndex + colors.length) % colors.length;
        const expectedIndex = (lastIndex + diff) % colors.length;
        isCorrect = selectedOption.value === colors[expectedIndex];
      } else {
        const shapes = ['circle', 'square', 'triangle', 'diamond', 'hexagon', 'star'];
        const lastIndex = shapes.indexOf(lastItem);
        const secondLastIndex = shapes.indexOf(secondLastItem);
        const diff = (lastIndex - secondLastIndex + shapes.length) % shapes.length;
        const expectedIndex = (lastIndex + diff) % shapes.length;
        isCorrect = selectedOption.value === shapes[expectedIndex];
      }
    }
    
    if (isCorrect) {
      // Increase score and difficulty
      setScore(score + 1);
      setDifficulty(Math.min(10, difficulty + 0.5));
      // Generate a new pattern
      generatePattern();
    } else {
      // Game over
      setGameOver(true);
    }
  };

  // Initialize game
  useEffect(() => {
    startGame();
  }, []);

  // Timer countdown
  useEffect(() => {
    if (!gameOver && timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      setGameOver(true);
    }
  }, [timeLeft, gameOver]);

  // Render item based on type
  const renderItem = (item, index) => {
    if (item.type === 'number') {
      return (
        <div key={index} className="flex items-center justify-center w-12 h-12 bg-blue-600 rounded-md text-white text-xl font-bold mx-1">
          {item.value}
        </div>
      );
    } else if (item.type === 'color') {
      return (
        <div 
          key={index} 
          className={`w-12 h-12 rounded-md mx-1 border-2 border-gray-700`}
          style={{ backgroundColor: item.value }}
        ></div>
      );
    } else if (item.type === 'shape') {
      return (
        <div key={index} className="w-12 h-12 flex items-center justify-center mx-1">
          {item.value === 'circle' && <div className="w-10 h-10 rounded-full bg-purple-500"></div>}
          {item.value === 'square' && <div className="w-10 h-10 bg-green-500"></div>}
          {item.value === 'triangle' && <div className="w-0 h-0 border-l-8 border-r-8 border-b-16 border-transparent border-b-red-500"></div>}
          {item.value === 'diamond' && <div className="w-10 h-10 bg-yellow-500 transform rotate-45"></div>}
          {item.value === 'hexagon' && <div className="w-10 h-10 bg-blue-500 rounded-md transform rotate-45"></div>}
          {item.value === 'star' && <div className="text-orange-500 text-3xl">★</div>}
        </div>
      );
    }
  };

  return (
    <div className="max-w-lg mx-auto p-4 bg-gray-900 rounded-lg text-white">
      <h1 className="text-2xl font-bold mb-4 text-center">Pattern Recognition</h1>
      
      <div className="mb-4 flex justify-between">
        <div>
          <span className="font-bold">Score:</span> {score}
        </div>
        <div>
          <span className="font-bold">Time:</span> {timeLeft}s
        </div>
        <div>
          <span className="font-bold">Level:</span> {Math.floor(difficulty)}
        </div>
      </div>
      
      {!gameOver ? (
        <>
          <div className="bg-gray-800 p-4 rounded-lg mb-4">
            <div className="mb-2 text-center">What comes next in this pattern?</div>
            <div className="flex justify-center items-center mb-4">
              {pattern.map((item, index) => renderItem(item, index))}
              <div className="w-12 h-12 flex items-center justify-center mx-1 bg-gray-700 rounded-md text-3xl">?</div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            {options.map((option, index) => (
              <button
                key={index}
                className="bg-gray-700 hover:bg-gray-600 p-4 rounded-lg flex items-center justify-center h-24"
                onClick={() => handleOptionSelect(option)}
              >
                {renderItem(option, `option-${index}`)}
              </button>
            ))}
          </div>
        </>
      ) : (
        <div className="text-center p-8">
          <h2 className="text-2xl font-bold mb-4">Game Over!</h2>
          <p className="mb-4">Final Score: {score}</p>
          <button 
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            onClick={startGame}
          >
            Play Again
          </button>
        </div>
      )}
    </div>
  );
};

export default PatternGame;
