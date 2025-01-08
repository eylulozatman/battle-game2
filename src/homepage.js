import React, { useState, useEffect } from 'react';
import { db } from './firebase'; // Firebase bağlantısını import edin
import { doc, setDoc, getDoc } from 'firebase/firestore';
import './homePage.css';

const Homepage = () => {
  const [username, setUsername] = useState('');
  const [roomId, setRoomId] = useState('');
  const [roomCreated, setRoomCreated] = useState(false);
  const [playerCount, setPlayerCount] = useState(0); // Oda oyuncu sayısını takip eder
  const [roomIdInput, setRoomIdInput] = useState('');
  const [roomCreator, setRoomCreator] = useState(null); // Odayı oluşturan oyuncu

  // Oda oluşturma fonksiyonu
  const createRoom = async () => {
    const newRoomId = Math.floor(Math.random() * 10000) + 1000; // 4 haneli rastgele oda numarası
    setRoomId(newRoomId);
    setRoomCreated(true);
    setRoomCreator(username); // Odayı oluşturan kişiyi kaydediyoruz

    // Firestore'a odanın kaydedilmesi
    const roomRef = doc(db, 'rooms', newRoomId.toString());
    await setDoc(roomRef, {
      playerCount: 1, // Oda ilk başta 1 oyuncu olacak
      players: [username], // Oyuncu adıyla başla
    });
  };

  // Odaya katılma fonksiyonu
  const enterRoom = async () => {
    const roomRef = doc(db, 'rooms', roomIdInput);
    const roomDoc = await getDoc(roomRef);

    if (roomDoc.exists()) {
      const data = roomDoc.data();
      if (data.playerCount < 2) {
        // Odaya yeni oyuncu ekleyebiliriz
        await setDoc(roomRef, {
          playerCount: data.playerCount + 1,
          players: [...data.players, username], // Oyuncu adı eklenir
        }, { merge: true });
        setPlayerCount(data.playerCount + 1); // Oyuncu sayısını güncelle
      } else {
        alert("Room is full!");
      }
    } else {
      alert("Room not found!");
    }
  };

  // Oda bilgisini güncelleme
  useEffect(() => {
    if (roomId) {
      const roomRef = doc(db, 'rooms', roomId.toString());
      const fetchRoomData = async () => {
        const roomDoc = await getDoc(roomRef);
        if (roomDoc.exists()) {
          const data = roomDoc.data();
          setPlayerCount(data.playerCount);
        }
      };
      fetchRoomData();
    }
  }, [roomId]);

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
          <div>
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

      {/* Eğer oda dolmuşsa ve odayı oluşturan kişiyse, Start Game butonunu göster */}
      {playerCount === 2 && roomCreator === username && (
        <button onClick={() => window.location.href = '/player-selection'}>
          Start Game
        </button>
      )}
    </div>
  );
};

export default Homepage;
