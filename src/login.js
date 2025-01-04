import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './login.css'

const Login = ({ setPlayerName, playerNumber }) => {
  const [name, setName] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim()) {
      setPlayerName(name); // This is the function being passed from HomePage
      navigate('/homepage'); // Redirect to HomePage after login
    } else {
      alert("Please enter a name!");
    }
  };

  return (
    <div>
      <h2>{`Enter Player ${playerNumber} Name`}</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter name"
        />
        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default Login;
