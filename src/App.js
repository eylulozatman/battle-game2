import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';  // Ensure Navigate is imported
import HomePage from './homepage';
import Combat from './combat';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/homepage" element={<HomePage />} />
        <Route path="/combat" element={<Combat />} />
        <Route path="/" element={<Navigate to="/homepage" />} />  {/* Fix for 'Navigate' is not defined */}
      </Routes>
    </Router>
  );
};

export default App;
