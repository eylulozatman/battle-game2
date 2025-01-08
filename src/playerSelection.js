import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where, doc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';
import './playerSelection.css';

const PlayerSelection = ({ navigate }) => {
  const [races, setRaces] = useState([]);
  const [types, setTypes] = useState([]);
  const [weapons, setWeapons] = useState([]);
  const [selectedRaceIndex, setSelectedRaceIndex] = useState(0);
  const [selectedTypeIndex, setSelectedTypeIndex] = useState(0);
  const [selectedWeapon, setSelectedWeapon] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const roomId = new URLSearchParams(window.location.search).get('roomId');
  const playerName = new URLSearchParams(window.location.search).get('username');

  useEffect(() => {
    const fetchData = async () => {
      const raceSnapshot = await getDocs(collection(db, 'races'));
      setRaces(raceSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));

      const weaponSnapshot = await getDocs(collection(db, 'weapons'));
      setWeapons(weaponSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchTypes = async () => {
      if (races.length > 0) {
        const race = races[selectedRaceIndex];
        const typeSnapshot = await getDocs(
          query(collection(db, 'types'), where('race_id', '==', race.id))
        );
        setTypes(typeSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
        setSelectedTypeIndex(0);
      }
    };
    fetchTypes();
  }, [races, selectedRaceIndex]);

  const handlePrevRace = () => setSelectedRaceIndex((prev) => (prev - 1 + races.length) % races.length);
  const handleNextRace = () => setSelectedRaceIndex((prev) => (prev + 1) % races.length);

  const handlePrevType = () => setSelectedTypeIndex((prev) => (prev - 1 + types.length) % types.length);
  const handleNextType = () => setSelectedTypeIndex((prev) => (prev + 1) % types.length);

  const handleSubmit = async () => {
    if (!selectedWeapon || types.length === 0) {
      alert('Please select a race, type, and weapon!');
      return;
    }

    const playerData = {
      name: playerName,
      race: races[selectedRaceIndex],
      type: types[selectedTypeIndex],
      weapon: selectedWeapon,
      hp: types[selectedTypeIndex].hp,
      submitted: true,
    };

    const roomRef = doc(db, 'rooms', roomId);
    await updateDoc(roomRef, {
      playersData: playerData,
    });

    setIsSubmitted(true);
    alert('Player data submitted! Waiting for the other player...');
  };

  return (
    <div className="player-selection-container">
      <h2>Welcome, {playerName}</h2>
      <div className="selection-section">
        <h3>Select Race</h3>
        <div className="selection-buttons">
          <button onClick={handlePrevRace}>◀</button>
          <span>{races[selectedRaceIndex]?.name || 'Loading...'}</span>
          <button onClick={handleNextRace}>▶</button>
        </div>
      </div>
      <div className="selection-section">
        <h3>Select Type</h3>
        <div className="selection-buttons">
          <button onClick={handlePrevType}>◀</button>
          <span>{types[selectedTypeIndex]?.name || 'Loading...'}</span>
          <button onClick={handleNextType}>▶</button>
        </div>
      </div>
      <div className="selection-section">
        <h3>Select Weapon</h3>
        <div className="weapon-options">
          {weapons.map((weapon) => (
            <button
              key={weapon.id}
              className={selectedWeapon === weapon ? 'selected' : ''}
              onClick={() => setSelectedWeapon(weapon)}
            >
              {weapon.name}
            </button>
          ))}
        </div>
      </div>
      <button onClick={handleSubmit} disabled={isSubmitted}>
        {isSubmitted ? 'Waiting for Other Player...' : 'Submit'}
      </button>
    </div>
  );
};

export default PlayerSelection;
