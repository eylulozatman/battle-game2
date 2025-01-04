import { useLocation } from 'react-router-dom';
import { useState } from 'react';
import './combat.css';

const Combat = () => {
  const location = useLocation();
  const { player1, player2 } = location.state;

  const [gameStatus, setGameStatus] = useState("");
  const [player1Health, setPlayer1Health] = useState(player1?.type?.hp);
  const [player2Health, setPlayer2Health] = useState(player2?.type?.hp);
  const [isGameOver, setIsGameOver] = useState(false);
  const [currentAttacker, setCurrentAttacker] = useState(1); // Player 1 starts
  const [damageCardActive, setDamageCardActive] = useState(false);
  const [shieldCardActive, setShieldCardActive] = useState(false);
  const [shieldDefender, setShieldDefender] = useState(null); // Tracks who has shielded
  const [player1DamageCardUsed, setPlayer1DamageCardUsed] = useState(false);
  const [player2DamageCardUsed, setPlayer2DamageCardUsed] = useState(false);
  const [player1ShieldUsed, setPlayer1ShieldUsed] = useState(false);
  const [player2ShieldUsed, setPlayer2ShieldUsed] = useState(false);

  const handleDamageCard = (attacker) => {
    if (attacker === 1 && !player1DamageCardUsed) {
      setPlayer1DamageCardUsed(true);
      setDamageCardActive(true);
      setGameStatus("Player 1 activates Damage Card!");
    } else if (attacker === 2 && !player2DamageCardUsed) {
      setPlayer2DamageCardUsed(true);
      setDamageCardActive(true);
      setGameStatus("Player 2 activates Damage Card!");
    }
  };

  const handleShieldCard = (defender) => {
    if (defender === 1 && !player1ShieldUsed) {
      setPlayer1ShieldUsed(true);
      setShieldCardActive(true);
      setShieldDefender(1); // Player 1 is defending next round
      setGameStatus("Player 1 activates Shield! Next attack will be blocked by 30%.");
    } else if (defender === 2 && !player2ShieldUsed) {
      setPlayer2ShieldUsed(true);
      setShieldCardActive(true);
      setShieldDefender(2); // Player 2 is defending next round
      setGameStatus("Player 2 activates Shield! Next attack will be blocked by 30%.");
    }
  };
  const attack = (attacker) => {
    let defender;
    let attackerWeapon;
    let defenderWeapon;
    let defenderHealth;
    let damage;
    let shieldMessage = '';
  
    if (attacker === 1) {
      defender = "Player 2";
      attackerWeapon = player1.weapon;
      defenderWeapon = player2.weapon;
      defenderHealth = player2Health;
    } else {
      defender = "Player 1";
      attackerWeapon = player2.weapon;
      defenderWeapon = player1.weapon;
      defenderHealth = player1Health;
    }
  
    let attackMessage = `${attacker === 1 ? 'Player 1' : 'Player 2'} attacks ${defender}!`;
  
    // Check if the defender has activated the shield
    if (shieldDefender === (attacker === 1 ? 2 : 1)) {
      // Apply shield effect to the defender
      damage = attackerWeapon.attack * 0.7; // Shield reduces damage by 30%
      shieldMessage = `${defender} uses shield! Blocked 30% of the damage.`;
      setShieldDefender(null); // Reset shield status for the next round
    } else {
      // No shield, apply full damage
      damage = attackerWeapon.attack;
    }
  
    // If the attacker used a damage card, increase the damage by 10%
    if (damageCardActive) {
      damage *= 1.1;
      setDamageCardActive(false); // Reset damage card active status
    }
  
    // Add defender's defense chance (healing)
    const defChance = Math.floor(Math.random() * 4) + 1;
    if (defChance === 2) {
      defenderHealth += defenderWeapon.def;
      attackMessage = `${defender} defends and heals ${defenderWeapon.def} HP!`;
    }
  
    // Apply the adjusted damage to the defender's health
    defenderHealth -= damage;
  
    // Print damage info first, then shield info if it exists
    let message = `${attackMessage} ${defender} takes ${damage.toFixed(2)} damage.`;
    if (shieldMessage) {
      message += ` ${shieldMessage}`;
    }
  
    setGameStatus(message);
  
    // Update the health of the players
    if (attacker === 1) {
      setPlayer2Health(defenderHealth);
    } else {
      setPlayer1Health(defenderHealth);
    }
  
    // Check if the game is over (health reaches 0 or below)
    if (defenderHealth <= 0) {
      setIsGameOver(true);
      setGameStatus(`${defender} is defeated!`);
    } else {
      // Switch turns between players
      const nextAttacker = attacker === 1 ? 2 : 1;
      setCurrentAttacker(nextAttacker);
    }
  };
  

  if (!player1 || !player2) {
    return <p>Loading...</p>;
  }

  return (
    <div className="combat-container">
      <h1>Combat</h1>
      <div className="combat-players">
        {/* Player 1 */}
        <div
          className={`player-combat ${currentAttacker === 1 ? 'active' : 'inactive'} ${player1Health <= 0 ? 'inactive' : ''}`}
          style={currentAttacker === 1 ? { transform: 'scale(1.1)' } : {}}
        >
          <img src={player1?.type?.photo_url} alt="Player 1" className="player-image" />
          <div className="hp-bar">
            <div className="hp-fill" style={{ width: `${(player1Health / player1.type.hp) * 100}%` }} />
          </div>
          <p>{player1.name}</p>
          <p>HP: {player1Health}</p>
          <button
            onClick={() => handleDamageCard(1)}
            className={`special-card-btn ${player1DamageCardUsed ? 'inactive' : ''}`}
            disabled={player1DamageCardUsed || isGameOver || currentAttacker !== 1}
          >
            Damage Card
          </button>
          <button
            onClick={() => handleShieldCard(1)}
            className={`special-card-btn ${player1ShieldUsed ? 'inactive' : ''}`}
            disabled={player1ShieldUsed || isGameOver || currentAttacker !== 1}
          >
            Shield Card
          </button>
          <button
            onClick={() => attack(1)}
            className="attack-btn"
            disabled={isGameOver || player1Health <= 0 || currentAttacker !== 1}
          >
            Attack
          </button>
        </div>

        {/* Player 2 */}
        <div
          className={`player-combat ${currentAttacker === 2 ? 'active' : 'inactive'} ${player2Health <= 0 ? 'inactive' : ''}`}
          style={currentAttacker === 2 ? { transform: 'scale(1.1)' } : {}}
        >
          <img src={player2?.type?.photo_url} alt="Player 2" className="player-image" />
          <div className="hp-bar">
            <div className="hp-fill" style={{ width: `${(player2Health / player2.type.hp) * 100}%` }} />
          </div>
          <p>{player2.name}</p>
          <p>HP: {player2Health}</p>
          <button
            onClick={() => handleDamageCard(2)}
            className={`special-card-btn ${player2DamageCardUsed ? 'inactive' : ''}`}
            disabled={player2DamageCardUsed || isGameOver || currentAttacker !== 2}
          >
            Damage Card
          </button>
          <button
            onClick={() => handleShieldCard(2)}
            className={`special-card-btn ${player2ShieldUsed ? 'inactive' : ''}`}
            disabled={player2ShieldUsed || isGameOver || currentAttacker !== 2}
          >
            Shield Card
          </button>
          <button
            onClick={() => attack(2)}
            className="attack-btn"
            disabled={isGameOver || player2Health <= 0 || currentAttacker !== 2}
          >
            Attack
          </button>
        </div>
      </div>
      <div className="game-status">{gameStatus}</div>
    </div>
  );
};

export default Combat;
