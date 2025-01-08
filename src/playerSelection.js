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
          setSelectedTypeIndex(0);
        } catch (error) {
          console.error('Error fetching types:', error);
        }
      }
    };
    fetchTypes();
  }, [selectedRaceIndex, races]);

  const handlePrevRace = () => setSelectedRaceIndex((prevIndex) => (prevIndex - 1 + races.length) % races.length);
  const handleNextRace = () => setSelectedRaceIndex((prevIndex) => (prevIndex + 1) % races.length);

  const handlePrevType = () => setSelectedTypeIndex((prevIndex) => (prevIndex - 1 + types.length) % types.length);
  const handleNextType = () => setSelectedTypeIndex((prevIndex) => (prevIndex + 1) % types.length);

  const handleWeaponSelect = (weapon) => setSelectedWeapon(weapon);

  const handleSubmit = async () => {
    if (types.length > 0 && selectedWeapon) {
      const playerData = {
        name: playerName,
        race: races[selectedRaceIndex],
        type: types[selectedTypeIndex],
        weapon: selectedWeapon,
        hp: types[selectedTypeIndex].hp,
        submitted: true
      };

      setPlayerData(playerData);

      const roomRef = doc(db, 'rooms', roomId);
      const roomSnapshot = await getDoc(roomRef);
      const roomData = roomSnapshot.data();

      roomData.playersData = roomData.playersData || [];
      roomData.playersData.push(playerData);

      await updateDoc(roomRef, { playersData: roomData.playersData });

      setIsSubmitted(true);

      const allPlayersSubmitted = roomData.playersData.filter(player => player.submitted).length === 2;

      if (allPlayersSubmitted) {
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
              <button onClick={handlePrevRace}>◀</button>
              <span>{races[selectedRaceIndex]?.name || 'Loading...'}</span>
              <button onClick={handleNextRace}>▶</button>
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
              <button onClick={handlePrevType}>◀</button>
              <span>{types[selectedTypeIndex]?.name || 'Loading...'}</span>
              <button onClick={handleNextType}>▶</button>
            </div>
          ) : (
            <p>Loading types...</p>
          )}
        </div>

        {/* Weapon Selection */}
        <div className="selection-section">
          <h3>Select Weapon</h3>
          {weapons.length > 0 ? (
            <div className="weapon-buttons">
              {weapons.map((weapon) => (
                <button
                  key={weapon.id}
                  onClick={() => handleWeaponSelect(weapon)}
                  className={selectedWeapon === weapon ? 'selected' : ''}
                >
                  {weapon.name}
                </button>
              ))}
            </div>
          ) : (
            <p>Loading weapons...</p>
          )}
        </div>

        {/* Submit Button */}
        <div className="submit-button">
          <button onClick={handleSubmit} disabled={isSubmitted}>
            {isSubmitted ? 'Submitted' : 'Submit'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlayerSelection;
