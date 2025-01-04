import React, { useState } from 'react';
import PlayerSelection from './playerSelection';  // Import PlayerSelection component
import Login from './login';  // Import Login component
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import './homePage.css'

const HomePage = () => {
  const [player1Name, setPlayer1Name] = useState(null);  // State for player 1's name
  const [player2Name, setPlayer2Name] = useState(null);  // State for player 2's name
  const [player1Data, setPlayer1Data] = useState(null);
  const [player2Data, setPlayer2Data] = useState(null);
  const navigate = useNavigate();

  const startCombat = () => {
    if (player1Data && player2Data) {
      navigate('/combat', { state: { player1: player1Data, player2: player2Data } });
    } else {
      alert("Both players must complete their selections.");
    }
  };

  return (
    <div className="home-page-container">
      {!player1Name ? (
        <Login setPlayerName={setPlayer1Name} playerNumber={1} />
      ) : !player2Name ? (
        <Login setPlayerName={setPlayer2Name} playerNumber={2} />
      ) : (
        <div>
          <PlayerSelection playerName={player1Name} setPlayerData={setPlayer1Data} />
          <PlayerSelection playerName={player2Name} setPlayerData={setPlayer2Data} />
          <button onClick={startCombat} className="fight-button">
            Fight!
          </button>
        </div>
      )}
    </div>
  );
};

export default HomePage;
