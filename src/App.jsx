import React, { useState, useEffect } from 'react';
import godsData from './godsData.json'; 
import './App.css';

function GodSelection({ onSelectGod, selectedGods }) {
  const handleGodClick = (god) => {
    if (selectedGods.length < 2 && !selectedGods.find(g => g.id === god.id)) {
      onSelectGod(god);
    }
  };

  return (
    <div className="mt-8 text-center">
      <h2 className="text-2xl font-bold mb-4">Select Two Gods for Battle</h2>
      <div className="flex flex-wrap justify-center gap-6">
        {godsData.map(god => (
          <div
            key={god.id}
            className={`bg-white p-4 rounded-lg shadow-md cursor-pointer transition transform hover:-translate-y-2 ${selectedGods.find(g => g.id === god.id) ? 'border-4 border-yellow-400' : ''}`}
            onClick={() => handleGodClick(god)}
          >
            <img src={god.image} alt={god.name} className="w-24 h-24 object-cover rounded-full mx-auto mb-2" />
            <h3 className="text-lg font-semibold">{god.name}</h3>
          </div>
        ))}
      </div>
       {selectedGods.length === 2 && (
        <p className="mt-6 text-xl text-blue-600 font-semibold">Gods selected! Prepare for battle!</p>
      )}
    </div>
  );
}

function BattleArea({ selectedGods, onBattleComplete, battleWinner }) {
  const [god1, god2] = selectedGods;
  const [score, setScore] = useState({ [god1.id]: 0, [god2.id]: 0 });
  const [currentAttribute, setCurrentAttribute] = useState(null);
  const [roundWinner, setRoundWinner] = useState(null);
  const [battleOver, setBattleOver] = useState(false);
  const [isAnimatingWin, setIsAnimatingWin] = useState(false);
  const winningScore = 3;

  const attributes = Object.keys(god1.attributes);

  const startRound = () => {
    if (battleOver) return;

    const randomAttribute = attributes[Math.floor(Math.random() * attributes.length)];
    setCurrentAttribute(randomAttribute);

    const god1Value = god1.attributes[randomAttribute];
    const god2Value = god2.attributes[randomAttribute];

    let winner = null;
    if (god1Value > god2Value) {
      winner = god1.id;
      setScore(prevScore => ({ ...prevScore, [god1.id]: prevScore[god1.id] + 1 }));
    } else if (god2Value > god1Value) {
      winner = god2.id;
      setScore(prevScore => ({ ...prevScore, [god2.id]: prevScore[god2.id] + 1 }));
    } else {
      winner = 'tie';
    }
    setRoundWinner(winner);
  };

  useEffect(() => {
    if (score[god1.id] >= winningScore) {
      setBattleOver(true);
      onBattleComplete(god1);
      setIsAnimatingWin(true);
    } else if (score[god2.id] >= winningScore) {
      setBattleOver(true);
      onBattleComplete(god2);
      setIsAnimatingWin(true);
    }
  }, [score, god1, god2, winningScore, onBattleComplete]);

  useEffect(() => {
    if (isAnimatingWin) {
      const timer = setTimeout(() => {
        setIsAnimatingWin(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isAnimatingWin]);

  const resetBattle = () => {
    setScore({ [god1.id]: 0, [god2.id]: 0 });
    setCurrentAttribute(null);
    setRoundWinner(null);
    setBattleOver(false);
    setIsAnimatingWin(false);
    onBattleComplete(null);
  };

  const winningGod = battleOver ? selectedGods.find(g => score[g.id] >= winningScore) : null;

  return (
    <div className="mt-8 p-8 border-2 border-gray-700 rounded-lg text-center bg-gray-100">
      <div className="flex justify-center items-center gap-10">
        <div className={`flex flex-col items-center ${winningGod && winningGod.id === god1.id && isAnimatingWin ? 'animate-pulse' : ''}`}>
          <img src={god1.image} alt={god1.name} className="w-32 h-32 object-cover rounded-full mx-auto mb-2" />
          <h3 className="text-xl font-bold">{god1.name}</h3>
          <p className="text-lg">Score: {score[god1.id]}</p>
        </div>

        <span className="text-3xl font-bold text-gray-800">VS</span>

        <div className={`flex flex-col items-center ${winningGod && winningGod.id === god2.id && isAnimatingWin ? 'animate-pulse' : ''}`}>
          <img src={god2.image} alt={god2.name} className="w-32 h-32 object-cover rounded-full mx-auto mb-2" />
          <h3 className="text-xl font-bold">{god2.name}</h3>
           <p className="text-lg">Score: {score[god2.id]}</p>
        </div>
      </div>

      {!battleOver && (
        <button
					type="button"
          className="mt-8 px-6 py-3 bg-blue-600 text-white text-lg font-semibold rounded-md shadow-md hover:bg-blue-700 transition"
          onClick={startRound}
        >
          {currentAttribute ? 'Next Round' : 'Start Battle'}
        </button>
      )}

      {currentAttribute && (
        <div className="mt-6 p-4 border border-gray-400 rounded-md bg-white">
          <h4 className="text-xl font-semibold mb-2">Round Attribute: {currentAttribute}</h4>
          <p className="text-lg">{god1.name}'s {currentAttribute}: {god1.attributes[currentAttribute]} vs {god2.name}'s {currentAttribute}: {god2.attributes[currentAttribute]}</p>
          {roundWinner === 'tie' ? (
            <p className="text-yellow-600 font-bold mt-2">This round is a tie!</p>
          ) : roundWinner ? (
            <p className="text-green-600 font-bold mt-2">{selectedGods.find(g => g.id === roundWinner).name} wins this round!</p>
          ) : (
             null
          )}
        </div>
      )}

      {battleOver && (
        <div className="mt-8">
          <h2 className="text-3xl font-bold text-green-700">Battle Over!</h2>
          <p className="text-2xl mt-2">{winningGod.name} wins the battle!</p>
          <button
            className="mt-6 px-6 py-3 bg-green-600 text-white text-lg font-semibold rounded-md shadow-md hover:bg-green-700 transition"
            onClick={resetBattle}
          >
            Start New Battle
          </button>
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [selectedGods, setSelectedGods] = useState([]);
  const [battleWinner, setBattleWinner] = useState(null);

  const handleSelectGod = (god) => {
    setSelectedGods(prevSelectedGods => {
      if (prevSelectedGods.length === 1 && prevSelectedGods[0].id === god.id) {
        return prevSelectedGods;
      }
      if (prevSelectedGods.length >= 2) {
          return prevSelectedGods;
      }
      return [...prevSelectedGods, god];
    });
  };

  const handleBattleComplete = (winner) => {
    setBattleWinner(winner);
     if (!winner) {
        setSelectedGods([]);
     }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-4xl font-extrabold text-center text-gray-800 mb-8">Greek God Arena</h1>

      {selectedGods.length < 2 && battleWinner === null && (
        <GodSelection onSelectGod={handleSelectGod} selectedGods={selectedGods} />
      )}

			{selectedGods.length === 2 && (
				<BattleArea
					selectedGods={selectedGods}
					onBattleComplete={handleBattleComplete}
					battleWinner={battleWinner}
				/>
			)}


    </div>
  );
}