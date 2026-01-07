// src/App.js
import React, { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import FurnitureModel from './components/threejs/FurnitureModel';
import './App.css';

function App() {
  const [currentModel, setCurrentModel] = useState('bedsideTable');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('App initialized with model:', currentModel);
    setIsLoading(false);
  }, []);

  const modelList = [
    { id: 'bedsideTable', name: 'Bedside Table' },
    { id: 'coffeeTable', name: 'Coffee Table' },
    { id: 'counter', name: 'Counter' },
    { id: 'sofa', name: 'Sofa'},
    { id: 'wardrobe', name: 'Wardrobe'},
    { id: 'nightTable', name: 'Night Table'}
  ];

  if (isLoading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="App">
      <header className="app-header">
        <h1>3D Furniture CVD Accessibility Test</h1>
        <div className="progress-indicator">
          Model: {currentModel}
        </div>
      </header>
      
      <div className="main-container">
        <div className="scene-container">
          <div className="canvas-wrapper">
            <Canvas camera={{ position: [5, 5, 5], fov: 50 }}>
              <ambientLight intensity={0.5} />
              <directionalLight position={[10, 10, 5]} intensity={1} />
              
              <FurnitureModel currentModel={currentModel} />
              
              <OrbitControls enableZoom={true} enablePan={true} />
              <gridHelper args={[10, 10]} />
            </Canvas>
          </div>
        </div>
        
        <div className="control-panel">
          <h2>Select Furniture Model</h2>
          <div className="model-selector">
            <div className="model-grid">
              {modelList.map((model) => (
                <button
                  key={model.id}
                  className={`model-button ${currentModel === model.id ? 'active' : ''}`}
                  onClick={() => setCurrentModel(model.id)}
                >
                  <div className="model-info">
                    <strong>{model.name}</strong>
                    
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;