// src/App.js
import React, { useState, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import FurnitureModel from './components/threejs/FurnitureModel';
import './App.css';

function App() {
  const [currentModel, setCurrentModel] = useState('bedsideTable');
  const [currentFilter, setCurrentFilter] = useState('natural');
  const [currentTexture, setCurrentTexture] = useState('none'); // 'none' for no texture
  const [isLoading, setIsLoading] = useState(true);
  const modelRef = useRef();

  useEffect(() => {
    console.log('App initialized with model:', currentModel);
    setIsLoading(false);
  }, []);

  const modelList = [
    { id: 'bedsideTable', name: 'Bedside Table', icon: '🛏️' },
    { id: 'coffeeTable', name: 'Coffee Table', icon: '☕' },
    { id: 'counter', name: 'Counter', icon: '📦' },
    { id: 'sofa', name: 'Sofa', icon: '🛋️' },
    { id: 'wardrobe', name: 'Wardrobe', icon: '👔' },
    { id: 'nightTable', name: 'Night Table', icon: '🌙' }
  ];

  const filterList = [
    { 
      id: 'natural', 
      name: 'Natural Wood', 
      description: 'Original wood finish',
      color: '#D4A76A',
      previewColor: 'linear-gradient(135deg, #D4A76A, #B08D57)'
    },
    { 
      id: 'dark', 
      name: 'Dark Wood', 
      description: 'Rich mahogany finish',
      color: '#3C2F2F',
      previewColor: 'linear-gradient(135deg, #3C2F2F, #2C2222)'
    },
    { 
      id: 'light', 
      name: 'Light Wood', 
      description: 'Light oak finish',
      color: '#E1C699',
      previewColor: 'linear-gradient(135deg, #E1C699, #D2B48C)'
    },
    { 
      id: 'white', 
      name: 'White', 
      description: 'Modern white finish',
      color: '#FFFFFF',
      previewColor: 'linear-gradient(135deg, #FFFFFF, #F5F5F5)'
    },
    { 
      id: 'gray', 
      name: 'Gray', 
      description: 'Contemporary gray',
      color: '#808080',
      previewColor: 'linear-gradient(135deg, #808080, #696969)'
    },
    { 
      id: 'blue', 
      name: 'Blue', 
      description: 'Modern blue accent',
      color: '#2196F3',
      previewColor: 'linear-gradient(135deg, #2196F3, #1976D2)'
    },
    { 
      id: 'green', 
      name: 'Green', 
      description: 'Eco-friendly green',
      color: '#4CAF50',
      previewColor: 'linear-gradient(135deg, #4CAF50, #388E3C)'
    },
    { 
      id: 'red', 
      name: 'Red', 
      description: 'Bold red finish',
      color: '#F44336',
      previewColor: 'linear-gradient(135deg, #F44336, #D32F2F)'
    },
    { 
      id: 'prot_red', 
      name: 'Protanopia Red', 
      description: 'Red color for Protanopia',
      color: '#FF8A65',
      previewColor: 'linear-gradient(135deg, #FF8A65, #F4511E)',
      isCVD: true
    },
    { 
      id: 'prot_green', 
      name: 'Protanopia Green', 
      description: 'Green color for Protanopia',
      color: '#81C784',
      previewColor: 'linear-gradient(135deg, #81C784, #4CAF50)',
      isCVD: true
    },
    { 
      id: 'deut_blue', 
      name: 'Deuteranopia Blue', 
      description: 'Blue color for Deuteranopia',
      color: '#64B5F6',
      previewColor: 'linear-gradient(135deg, #64B5F6, #2196F3)',
      isCVD: true
    },
    { 
      id: 'deut_yellow', 
      name: 'Deuteranopia Yellow', 
      description: 'Yellow color for Deuteranopia',
      color: '#FFD54F',
      previewColor: 'linear-gradient(135deg, #FFD54F, #FFC107)',
      isCVD: true
    },
    { 
      id: 'trit_blue', 
      name: 'Tritanopia Blue', 
      description: 'Blue color for Tritanopia',
      color: '#4FC3F7',
      previewColor: 'linear-gradient(135deg, #4FC3F7, #03A9F4)',
      isCVD: true
    },
    { 
      id: 'trit_pink', 
      name: 'Tritanopia Pink', 
      description: 'Pink color for Tritanopia',
      color: '#F06292',
      previewColor: 'linear-gradient(135deg, #F06292, #E91E63)',
      isCVD: true
    }
  ];

  const textureList = [
    { 
      id: 'none', 
      name: 'No Texture', 
      description: 'Solid color only',
      icon: '🟦',
      type: 'solid'
    },
    { 
      id: 'wood', 
      name: 'Wood Grain', 
      description: 'Natural wood texture',
      icon: '🪵',
      type: 'texture',
      imageUrl: '/textures/wood.jpg'
    },
    { 
      id: 'marble', 
      name: 'Marble', 
      description: 'Elegant marble texture',
      icon: '🗿',
      type: 'texture',
      imageUrl: '/textures/marble.jpg'
    },
    { 
      id: 'fabric', 
      name: 'Fabric', 
      description: 'Soft fabric texture',
      icon: '🧵',
      type: 'texture',
      imageUrl: '/textures/fabric.jpg'
    },
    { 
      id: 'metal', 
      name: 'Metal', 
      description: 'Brushed metal texture',
      icon: '🔩',
      type: 'texture',
      imageUrl: '/textures/metal.jpg'
    },
    { 
      id: 'leather', 
      name: 'Leather', 
      description: 'Genuine leather texture',
      icon: '🐄',
      type: 'texture',
      imageUrl: '/textures/leather.jpg'
    },
    { 
      id: 'concrete', 
      name: 'Concrete', 
      description: 'Industrial concrete texture',
      icon: '🏗️',
      type: 'texture',
      imageUrl: '/textures/concrete.jpg'
    },
    { 
      id: 'glass', 
      name: 'Glass', 
      description: 'Transparent glass effect',
      icon: '🔮',
      type: 'texture',
      imageUrl: '/textures/glass.jpg',
      isTransparent: true
    }
  ];

  if (isLoading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="App">
      <header className="app-header">
        <div className="header-left">
          <h1>3D Furniture CVD Accessibility Test</h1>
          <div className="current-selection">
            <span className="current-model">Model: {modelList.find(m => m.id === currentModel)?.name}</span>
            <span className="current-filter">Color: {filterList.find(f => f.id === currentFilter)?.name}</span>
            <span className="current-texture">Texture: {textureList.find(t => t.id === currentTexture)?.name}</span>
          </div>
        </div>
        <div className="progress-indicator">
          CVD Accessibility Mode
        </div>
      </header>
      
      <div className="main-container">
        <div className="scene-container">
          <div className="canvas-wrapper">
            <Canvas camera={{ position: [5, 5, 5], fov: 50 }}>
            
              <ambientLight intensity={1.2} color="#ffffff" />
              <directionalLight position={[10, 10, 5]} intensity={1} />
              
              <FurnitureModel 
                currentModel={currentModel} 
                currentFilter={currentFilter}
                currentTexture={currentTexture}
                ref={modelRef}
              />
              
              <OrbitControls enableZoom={true} enablePan={true} />
              <gridHelper args={[10, 10]} />
            </Canvas>
          </div>
        </div>
        
        <div className="control-panel">
          <div className="control-section">
            <h2>Select Furniture Model</h2>
            <div className="model-selector">
              <div className="model-grid">
                {modelList.map((model) => (
                  <button
                    key={model.id}
                    className={`model-button ${currentModel === model.id ? 'active' : ''}`}
                    onClick={() => setCurrentModel(model.id)}
                  >
                    <div className="model-thumbnail">
                      {model.icon}
                    </div>
                    <div className="model-info">
                      <strong>{model.name}</strong>
                      <span className="model-type">{model.id}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="control-section">
            <h2>Color Filters</h2>
            <div className="filter-section">
              <div className="filter-category">
                <h3>Standard Colors</h3>
                <div className="filter-grid">
                  {filterList.filter(f => !f.isCVD).map((filter) => (
                    <button
                      key={filter.id}
                      className={`filter-button ${currentFilter === filter.id ? 'active' : ''}`}
                      onClick={() => setCurrentFilter(filter.id)}
                      title={filter.description}
                    >
                      <div 
                        className="filter-preview"
                        style={{ background: filter.previewColor }}
                      />
                      <div className="filter-info">
                        <strong>{filter.name}</strong>
                        <span className="filter-description">{filter.description}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="filter-category">
                <h3>CVD Accessibility Colors</h3>
                <p className="cvd-description">
                  Colors optimized for different types of Color Vision Deficiency
                </p>
                <div className="filter-grid">
                  {filterList.filter(f => f.isCVD).map((filter) => (
                    <button
                      key={filter.id}
                      className={`filter-button cvd-filter ${currentFilter === filter.id ? 'active' : ''}`}
                      onClick={() => setCurrentFilter(filter.id)}
                      title={filter.description}
                    >
                      <div 
                        className="filter-preview"
                        style={{ background: filter.previewColor }}
                      >
                        <span className="cvd-badge">CVD</span>
                      </div>
                      <div className="filter-info">
                        <strong>{filter.name}</strong>
                        <span className="filter-description">{filter.description}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="control-section">
            <h2>Texture Options</h2>
            <div className="texture-toggle">
              <div className="toggle-group">
                <button
                  className={`toggle-button ${currentTexture === 'none' ? 'active' : ''}`}
                  onClick={() => setCurrentTexture('none')}
                >
                  <div className="toggle-icon">🟦</div>
                  <div className="toggle-info">
                    <strong>Solid Color</strong>
                    <span>No texture, pure color</span>
                  </div>
                </button>
                <button
                  className={`toggle-button ${currentTexture !== 'none' ? 'active' : ''}`}
                  onClick={() => {
                    if (currentTexture === 'none') {
                      setCurrentTexture('wood'); // Default to wood texture
                    }
                  }}
                >
                  <div className="toggle-icon">🖼️</div>
                  <div className="toggle-info">
                    <strong>With Texture</strong>
                    <span>Apply material texture</span>
                  </div>
                </button>
              </div>
            </div>
            
            {currentTexture !== 'none' && (
              <div className="texture-section">
                <h3>Select Texture</h3>
                <div className="texture-grid">
                  {textureList.filter(t => t.id !== 'none').map((texture) => (
                    <button
                      key={texture.id}
                      className={`texture-button ${currentTexture === texture.id ? 'active' : ''}`}
                      onClick={() => setCurrentTexture(texture.id)}
                      title={texture.description}
                    >
                      <div className="texture-preview">
                        <div className="texture-icon">{texture.icon}</div>
                        {texture.imageUrl && (
                          <div 
                            className="texture-image"
                            style={{ 
                              backgroundImage: `url(${texture.imageUrl})`,
                              backgroundSize: 'cover',
                              backgroundPosition: 'center'
                            }}
                          />
                        )}
                      </div>
                      <div className="texture-info">
                        <strong>{texture.name}</strong>
                        <span className="texture-description">{texture.description}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;