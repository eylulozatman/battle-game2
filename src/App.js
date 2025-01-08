import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom'; // HashRouter'ı kullanıyoruz
import HomePage from './homepage';
import Combat from './combat';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/homepage" element={<HomePage />} />
        <Route path="/combat" element={<Combat />} />
        <Route path="/" element={<Navigate to="/homepage" />} />
      </Routes>
    </Router>
  );
};

export default App;
