import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { doc, setDoc, getDoc, onSnapshot } from 'firebase/firestore';
import './homePage.css';

const Homepage = () => {
  const [username, setUsername] = useState('');
  const [roomId, setRoomId] = useState('');
  const [roomCreated, setRoomCreated] = useState(false);
  const [playerCount, setPlayerCount] = useState(0);
  const [roomIdInput, setRoomIdInput] = useState('');
  const [userID, setUserID] = useState('');
  const [isRoomFull, setIsRoomFull] = useState(false);

  const createRoom = async () => {
    const newRoomId = Math.floor(Math.random() * 10000) + 1000; // Generate random room ID
    setRoomId(newRoomId);
    setRoomCreated(true);

    const roomRef = doc(db, 'rooms', newRoomId.toString());
    await setDoc(roomRef, {
      playerCount: 1,
      players: [username],
      playersData: [{ username, userID: Math.random().toString(36).substr(2, 9) }],
    });
  };

  const enterRoom = async () => {
    const roomRef = doc(db, 'rooms', roomIdInput);
    const roomDoc = await getDoc(roomRef);

    if (roomDoc.exists()) {
      const data = roomDoc.data();
      if (data.playerCount < 2) {
        const newUserID = Math.random().toString(36).substr(2, 9);
        setUserID(newUserID);

        await setDoc(
          roomRef,
          {
            playerCount: data.playerCount + 1,
            players: [...data.players, username],
            playersData: [...data.playersData, { username, userID: newUserID }],
          },
          { merge: true }
        );
      } else {
        alert('Room is full!');
      }
    } else {
      alert('Room not found!');
    }
  };

  useEffect(() => {
    if (roomId || roomIdInput) {
      const roomRef = doc(db, 'rooms', (roomId || roomIdInput).toString());
      const unsubscribe = onSnapshot(roomRef, (roomDoc) => {
        if (roomDoc.exists()) {
          const data = roomDoc.data();
          setPlayerCount(data.playerCount);
          setIsRoomFull(data.playerCount === 2);
        }
      });

      return () => unsubscribe();
    }
  }, [roomId, roomIdInput]);

  useEffect(() => {
    if (isRoomFull) {
      window.location.href = `/player-selection?roomId=${roomId || roomIdInput}`;
    }
  }, [isRoomFull, roomId, roomIdInput]);

  const handleUsernameChange = (e) => {
    setUsername(e.target.value);
  };

  const handleRoomIdInputChange = (e) => {
    setRoomIdInput(e.target.value);
  };

  return (
    <div className="homepage-container">
      <h2>Welcome to the Game</h2>
      <input
        type="text"
        value={username}
        onChange={handleUsernameChange}
        placeholder="Enter your username"
      />
      <div className="room-options">
        <button onClick={createRoom} disabled={username === ''}>
          Create Room
        </button>
        {roomCreated && (
          <div className="room-details">
            <p>Room ID: {roomId}</p>
            <p>Share this ID with your friend!</p>
          </div>
        )}
        <input
          type="text"
          value={roomIdInput}
          onChange={handleRoomIdInputChange}
          placeholder="Enter Room ID"
        />
        <button
          onClick={enterRoom}
          disabled={username === '' || roomIdInput === ''}
        >
          Enter Room
        </button>
      </div>

      <p>Players: {playerCount} / 2</p>
    </div>
  );
};

export default Homepage;
