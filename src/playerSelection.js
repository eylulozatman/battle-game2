import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where, doc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';
import './playerSelection.css';

const PlayerSelection = ({ playerName, roomId, setPlayerData, navigate }) => {
  const [races, setRaces] = useState([]);
  const [types, setTypes] = useState([]);
  const [weapons, setWeapons] = useState([]);
  const [selectedRaceIndex, setSelectedRaceIndex] = useState(0);
  const [selectedTypeIndex, setSelectedTypeIndex] = useState(0);
  const [selectedWeapon, setSelectedWeapon] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [playersData, setPlayersData] = useState([]);

  // Fetch races, weapons, and types from Firebase
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get races
        const raceSnapshot = await getDocs(collection(db, 'races'));
        const racesData = raceSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setRaces(racesData);

        // Get weapons
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

  // Fetch types based on the selected race
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

  // Handle race selection
  const handlePrevRace = () => {
    setSelectedRaceIndex((prevIndex) => (prevIndex - 1 + races.length) % races.length);
  };

  const handleNextRace = () => {
    setSelectedRaceIndex((prevIndex) => (prevIndex + 1) % races.length);
  };

  // Handle type selection
  const handlePrevType = () => {
    setSelectedTypeIndex((prevIndex) => (prevIndex - 1 + types.length) % types.length);
  };

  const handleNextType = () => {
    setSelectedTypeIndex((prevIndex) => (prevIndex + 1) % types.length);
  };

  // Handle weapon selection
  const handleWeaponSelect = (weapon) => {
    setSelectedWeapon(weapon);
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (types.length > 0 && selectedWeapon) {
      const playerData = {
        name: playerName,
        race: races[selectedRaceIndex],
        type: types[selectedTypeIndex],
        weapon: selectedWeapon,
        hp: types[selectedTypeIndex].hp, // Assuming hp is a property of type
        submitted: true // Mark as submitted
      };

      setPlayerData(playerData);

      // Save player data to Firebase
      const roomRef = doc(db, 'rooms', roomId);
      const roomSnapshot = await getDocs(roomRef);
      const roomData = roomSnapshot.data();

      // Update player data in the room document
      roomData.playersData = roomData.playersData || [];
      roomData.playersData.push(playerData);

      // Update the room with the new player data
      await updateDoc(roomRef, {
        playersData: roomData.playersData
      });

      // Set the submission state
      setIsSubmitted(true);

      // Check if both players have submitted, then navigate to combat
      const allPlayersSubmitted = roomData.playersData.filter(player => player.submitted).length === 2;

      if (allPlayersSubmitted) {
        // After a short delay, navigate to combat page
        setTimeout(() => {
          navigate(`/combat/${roomId}`);
        }, 2000);
      }
    } else {
      alert('Please select race, type, and weapon!');
    }
  };

  return (
    <div className="player-container">
      <h2>{playerName}</h2>

      <div className="selection-container">
        {/* Race Selection */}
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

        {/* Type Selection */}
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

        {/* Weapon Selection */}
        <div className="selection-section">
          <h3>Select Weapon</h3>
          {weapons.length > 0 ? (
            <div className="weapon-grid">
              {weapons.map((weapon) => (
                <div key={weapon.id} className="weapon-card">
                  <button
                    onClick={() => handleWeaponSelect(weapon)}
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
        <button onClick={handleSubmit} className="submit-button" disabled={isSubmitted}>
          {isSubmitted ? 'Waiting for Other Player...' : 'Submit'}
        </button>
      </div>
    </div>
  );
};

export default PlayerSelection;
