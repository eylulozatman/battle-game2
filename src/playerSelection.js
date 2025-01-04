import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from './firebase';
import './playerSelection.css';

const PlayerSelection = ({ playerName, setPlayerData }) => {
  const [races, setRaces] = useState([]);
  const [types, setTypes] = useState([]);
  const [weapons, setWeapons] = useState([]);
  const [selectedRaceIndex, setSelectedRaceIndex] = useState(0);
  const [selectedTypeIndex, setSelectedTypeIndex] = useState(0);
  const [selectedWeapon, setSelectedWeapon] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const raceSnapshot = await getDocs(collection(db, 'races'));
        const racesData = raceSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setRaces(racesData);

        const weaponSnapshot = await getDocs(collection(db, 'weapons'));
        const weaponsData = weaponSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setWeapons(weaponsData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchTypes = async () => {
      if (races.length > 0) {
        const selectedRace = races[selectedRaceIndex];
        try {
          const typeSnapshot = await getDocs(
            query(collection(db, 'types'), where('race_id', '==', selectedRace.id))
          );
          const typesData = typeSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setTypes(typesData);
          setSelectedTypeIndex(0);  // Reset type selection on race change
        } catch (error) {
          console.error('Error fetching types:', error);
        }
      }
    };
    fetchTypes();
  }, [selectedRaceIndex, races]);

  const handlePrevRace = () => {
    setSelectedRaceIndex((prevIndex) => (prevIndex - 1 + races.length) % races.length);
  };

  const handleNextRace = () => {
    setSelectedRaceIndex((prevIndex) => (prevIndex + 1) % races.length);
  };

  const handlePrevType = () => {
    setSelectedTypeIndex((prevIndex) => (prevIndex - 1 + types.length) % types.length);
  };

  const handleNextType = () => {
    setSelectedTypeIndex((prevIndex) => (prevIndex + 1) % types.length);
  };

  const handleSubmit = () => {
    if (types.length > 0 && selectedWeapon) {
      setPlayerData({
        name: playerName,
        race: races[selectedRaceIndex],
        type: types[selectedTypeIndex],
        weapon: selectedWeapon,
        hp: types[selectedTypeIndex].hp  // Assuming hp is a property of type
      });
      alert(`${playerName} is ready for combat!`);
    }
  };

  return (
    <div className="player-container">
      <h2>{playerName}</h2>
  
      <div className="selection-container">
        <div className="selection-section">
          <h3>Select Race</h3>
          {races.length > 0 ? (
            <div className="selection-buttons">
              <button className="icon-button" onClick={handlePrevRace}>
                &#8592; {/* Left Arrow Icon */}
              </button>
              <span>{races[selectedRaceIndex]?.name || 'Loading...'}</span>
              <button className="icon-button" onClick={handleNextRace}>
                &#8594; {/* Right Arrow Icon */}
              </button>
            </div>
          ) : (
            <p>Loading races...</p>
          )}
        </div>
  
        <div className="selection-section">
          <h3>Select Type</h3>
          {types.length > 0 ? (
            <div className="type-container">
              <button className="icon-button" onClick={handlePrevType}>
                &#8592; {/* Left Arrow Icon */}
              </button>
              <div className="type-card">
                <h4>{types[selectedTypeIndex]?.name || 'Loading...'}</h4>
                {types[selectedTypeIndex]?.photo_url && (
                  <img
                    src={types[selectedTypeIndex].photo_url}
                    alt={types[selectedTypeIndex]?.name}
                    className="type-photo"
                  />
                )}
              </div>
              <button className="icon-button" onClick={handleNextType}>
                &#8594; {/* Right Arrow Icon */}
              </button>
            </div>
          ) : (
            <p>No types available for this race</p>
          )}
        </div>
  
        <div className="selection-section">
          <h3>Select Weapon</h3>
          {weapons.length > 0 ? (
            <div className="weapon-grid">
              {weapons.map((weapon) => (
                <div key={weapon.id} className="weapon-card">
                  <button
                    onClick={() => setSelectedWeapon(weapon)}
                    className={`weapon-button ${selectedWeapon?.id === weapon.id ? 'selected' : ''}`}
                  >
                    {weapon.name}
                  </button>
                  <div className="weapon-details">
                    <span>Atk: {weapon.attack}</span>
                    <span>Def: {weapon.def}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p>No weapons available</p>
          )}
        </div>
      </div>
  
      <div className="submit-button-container">
        <button onClick={handleSubmit} className="submit-button">
          Submit
        </button>
      </div>
    </div>
  );
  
  
  
};

export default PlayerSelection;
