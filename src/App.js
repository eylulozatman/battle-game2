import React from 'react';
import { HashRouter as Router, Route, Routes } from 'react-router-dom';
import Homepage from './homepage'; // Homepage bileşeni
import PlayerSelection from './playerSelection'; // PlayerSelection bileşeni
import Combat from './combat'; // Combat bileşeni

function App() {
  return (
    <Router>
      <Routes>
        {/* Ana sayfa */}
        <Route path="/" element={<Homepage />} />
        {/* Player Selection sayfası */}
        <Route path="/player-selection" element={<PlayerSelection />} />
        {/* Combat sayfası */}
        <Route path="/combat/:roomId" element={<Combat />} />
      </Routes>
    </Router>
  );
}

export default App;
