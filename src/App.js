// frontend/src/App.js - Temporary debug version
import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [currentModel, setCurrentModel] = useState('bedsideTable');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('App initialized with model:', currentModel);
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="App">
      <header className="app-header">
        <h1>3D Furniture Test</h1>
      </header>
      
      <div style={{ padding: '20px' }}>
        <h2>Current Model: {currentModel}</h2>
        
        <div style={{ marginBottom: '20px' }}>
          <button onClick={() => setCurrentModel('bedsideTable')} style={buttonStyle}>
            BedsideTable
          </button>
          <button onClick={() => setCurrentModel('coffeeTable')} style={buttonStyle}>
            Coffee Table
          </button>
          <button onClick={() => setCurrentModel('counter')} style={buttonStyle}>
            Counter
          </button>
          <button onClick={() => setCurrentModel('sofa')} style={buttonStyle}>
            Sofa
          </button>
        </div>
        
        <div style={{ width: '800px', height: '600px', border: '1px solid #ccc' }}>
          {/* Your 3D scene will go here */}
          <p>3D Scene Placeholder for: {currentModel}</p>
        </div>
      </div>
    </div>
  );
}

const buttonStyle = {
  margin: '5px',
  padding: '10px 20px',
  fontSize: '16px',
  backgroundColor: '#4CAF50',
  color: 'white',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer'
};

export default App;