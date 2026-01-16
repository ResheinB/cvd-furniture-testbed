// src/App.js
import React, { useState, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import FurnitureModel from './components/threejs/FurnitureModel';
import './App.css';

function App() {
  const [currentModel, setCurrentModel] = useState('desk');
  const [currentFilter, setCurrentFilter] = useState('white'); // Default to white
  const [currentTexture, setCurrentTexture] = useState('none');
  const [selectedSection, setSelectedSection] = useState(null);
  const [sectionColors, setSectionColors] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [cvdMode, setCvdMode] = useState(true); // CVD mode always ON
  const modelRef = useRef();

  // Section-specific color palette
  const sectionColorPalette = [
    '#2764AE', // Blue
    '#E0DFDA', // Neutral
    '#F28C28', // Orange
    '#F1C40F', // Yellow
    '#333333', // Dark grey
    '#DDDDDD', // Light metal
    '#A6764D', // Wood
    '#F5F5F5', // Light grey
    '#8A2BE2', // Purple
    '#FF6B6B', // Coral
    '#4ECDC4', // Turquoise
    '#45B7D1', // Sky blue
    '#D4A76A', // Natural Wood
    '#3C2F2F', // Dark Wood
    '#E1C699', // Light Wood
    '#FFFFFF', // White
    '#808080', // Gray
    '#2196F3', // Blue
    '#4CAF50', // Green
    '#F44336', // Red
  ];

  useEffect(() => {
    console.log('App initialized with model:', currentModel);
    setIsLoading(false);
  }, []);

  const modelList = [
    { id: 'desk', name: 'Desk', icon: '🪑' },
    { id: 'chair', name: 'Chair', icon: '💺' },
    { id: 'wardrobe', name: 'Wardrobe', icon: '🚪' },
    { id: 'bookshelf', name: 'Bookshelf', icon: '📚' },
    { id: 'bed', name: 'Bed', icon: '🛏️' },
    { id: 'sofa', name: 'Sofa', icon: '🛋️' },
  ];

  // CVD FILTERS ONLY - Always available
  const cvdFilterList = [
    { 
      id: 'white', 
      name: 'Default White', 
      description: 'Clean white finish - default model color',
      color: '#FFFFFF',
      previewColor: 'linear-gradient(135deg, #FFFFFF, #F5F5F5)',
      isCVD: false // Mark as default
    },
    { 
      id: 'prot_red', 
      name: 'Protanopia Red', 
      description: 'Red color optimized for Protanopia',
      color: '#FF8A65',
      previewColor: 'linear-gradient(135deg, #FF8A65, #F4511E)',
      isCVD: true,
      cvdType: 'Protanopia'
    },
    { 
      id: 'prot_green', 
      name: 'Protanopia Green', 
      description: 'Green color optimized for Protanopia',
      color: '#81C784',
      previewColor: 'linear-gradient(135deg, #81C784, #4CAF50)',
      isCVD: true,
      cvdType: 'Protanopia'
    },
    { 
      id: 'deut_blue', 
      name: 'Deuteranopia Blue', 
      description: 'Blue color optimized for Deuteranopia',
      color: '#64B5F6',
      previewColor: 'linear-gradient(135deg, #64B5F6, #2196F3)',
      isCVD: true,
      cvdType: 'Deuteranopia'
    },
    { 
      id: 'deut_yellow', 
      name: 'Deuteranopia Yellow', 
      description: 'Yellow color optimized for Deuteranopia',
      color: '#FFD54F',
      previewColor: 'linear-gradient(135deg, #FFD54F, #FFC107)',
      isCVD: true,
      cvdType: 'Deuteranopia'
    },
    { 
      id: 'trit_blue', 
      name: 'Tritanopia Blue', 
      description: 'Blue color optimized for Tritanopia',
      color: '#4FC3F7',
      previewColor: 'linear-gradient(135deg, #4FC3F7, #03A9F4)',
      isCVD: true,
      cvdType: 'Tritanopia'
    },
    { 
      id: 'trit_pink', 
      name: 'Tritanopia Pink', 
      description: 'Pink color optimized for Tritanopia',
      color: '#F06292',
      previewColor: 'linear-gradient(135deg, #F06292, #E91E63)',
      isCVD: true,
      cvdType: 'Tritanopia'
    },
    { 
      id: 'achroma_bw', 
      name: 'Achromatopsia B&W', 
      description: 'High contrast black & white for Achromatopsia',
      color: '#FFFFFF',
      previewColor: 'linear-gradient(135deg, #FFFFFF, #000000)',
      isCVD: true,
      cvdType: 'Achromatopsia'
    },
    { 
      id: 'achroma_contrast', 
      name: 'Achromatopsia Contrast', 
      description: 'High contrast grayscale for Achromatopsia',
      color: '#808080',
      previewColor: 'linear-gradient(135deg, #FFFFFF, #808080, #000000)',
      isCVD: true,
      cvdType: 'Achromatopsia'
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

  // Function to handle section selection
  const handleSectionSelect = (sectionName) => {
    setSelectedSection(sectionName);
  };

  // Function to apply color to selected section
  const applyColorToSection = (color) => {
    if (!selectedSection) return;
    
    setSectionColors(prev => ({
      ...prev,
      [selectedSection]: color
    }));
    
    // Apply the color to the model
    if (modelRef.current && modelRef.current.applyColorToSection) {
      modelRef.current.applyColorToSection(selectedSection, color);
    }
  };

  // Quick action: Reset all customizations
  const resetAllCustomizations = () => {
    if (modelRef.current && modelRef.current.resetAllColors) {
      const resetCount = modelRef.current.resetAllColors();
      setSectionColors({});
      alert(`Reset ${resetCount} customizations`);
    }
  };

  // Quick action: Reset to default white
  const resetToDefaultWhite = () => {
    setCurrentFilter('white');
    if (modelRef.current && modelRef.current.resetAllColors) {
      modelRef.current.resetAllColors();
      setSectionColors({});
      alert('Reset to default white');
    }
  };

  // Handle model change - clear section colors for new model
  const handleModelChange = (modelId) => {
    console.log(`Changing model from ${currentModel} to ${modelId}`);
    setCurrentModel(modelId);
    setSelectedSection(null);
    // Clear section colors when switching models
    setSectionColors({});
  };

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
            <span className="current-filter">CVD Filter: {cvdFilterList.find(f => f.id === currentFilter)?.name}</span>
            <span className="current-texture">Texture: {textureList.find(t => t.id === currentTexture)?.name}</span>
            {selectedSection && <span className="current-section">Editing: {selectedSection}</span>}
          </div>
        </div>
        <div className="header-right">
          <div className="cvd-mode-indicator">
            <span className="cvd-badge-large">CVD MODE</span>
            <span className="cvd-status active">ACTIVE</span>
          </div>
        </div>
      </header>
      
      <div className="main-container">
        <div className="scene-container">
          <div className="canvas-wrapper">
            

            <Canvas 
              camera={{ position: [5, 5, 5], fov: 50 }}
              style={{ cursor: 'pointer' }}
              onCreated={({ gl }) => {
                gl.domElement.style.touchAction = 'none';
              }}
            >
              {/* Enhanced Lighting Setup */}
              <ambientLight intensity={1.5} color="#ffffff" />
              <directionalLight 
                position={[10, 15, 10]} 
                intensity={1.2}
                castShadow
                shadow-mapSize-width={2048}
                shadow-mapSize-height={2048}
                shadow-camera-far={50}
                shadow-camera-left={-20}
                shadow-camera-right={20}
                shadow-camera-top={20}
                shadow-camera-bottom={-20}
              />
              <directionalLight 
                position={[-10, 10, -5]} 
                intensity={0.6}
                color="#ffeb3b"
              />
              <pointLight 
                position={[0, 10, 0]} 
                intensity={0.8}
                color="#ffffff"
                distance={30}
                decay={2}
              />
              <hemisphereLight 
                skyColor="#ffffff"
                groundColor="#808080"
                intensity={0.8}
              />
              
              <FurnitureModel 
                currentModel={currentModel} 
                currentFilter={currentFilter}
                currentTexture={currentTexture}
                selectedSection={selectedSection}
                sectionColors={sectionColors}
                onSectionSelect={handleSectionSelect}
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
                    onClick={() => handleModelChange(model.id)}
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
            <h2>CVD Accessibility Colors</h2>
            <div className="filter-section">
              <p className="cvd-description">
                Colors optimized for different types of Color Vision Deficiency (CVD)
              </p>
              
              {/* Default White Option */}
              <div className="default-section">
                <h3>Default Color</h3>
                <div className="filter-grid">
                  {cvdFilterList.filter(f => !f.isCVD).map((filter) => (
                    <button
                      key={filter.id}
                      className={`filter-button default-filter ${currentFilter === filter.id ? 'active' : ''}`}
                      onClick={() => setCurrentFilter(filter.id)}
                      title={filter.description}
                    >
                      <div 
                        className="filter-preview"
                        style={{ background: filter.previewColor }}
                      >
                        <span className="default-badge">D</span>
                      </div>
                      <div className="filter-info">
                        <strong>{filter.name}</strong>
                        <span className="filter-description">{filter.description}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="cvd-type-section">
                <h3>Protanopia (Red-Green)</h3>
                <div className="filter-grid">
                  {cvdFilterList.filter(f => f.cvdType === 'Protanopia').map((filter) => (
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
                        <span className="cvd-badge">P</span>
                      </div>
                      <div className="filter-info">
                        <strong>{filter.name}</strong>
                        <span className="filter-description">{filter.description}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="cvd-type-section">
                <h3>Deuteranopia (Red-Green)</h3>
                <div className="filter-grid">
                  {cvdFilterList.filter(f => f.cvdType === 'Deuteranopia').map((filter) => (
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
                        <span className="cvd-badge">D</span>
                      </div>
                      <div className="filter-info">
                        <strong>{filter.name}</strong>
                        <span className="filter-description">{filter.description}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="cvd-type-section">
                <h3>Tritanopia (Blue-Yellow)</h3>
                <div className="filter-grid">
                  {cvdFilterList.filter(f => f.cvdType === 'Tritanopia').map((filter) => (
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
                        <span className="cvd-badge">T</span>
                      </div>
                      <div className="filter-info">
                        <strong>{filter.name}</strong>
                        <span className="filter-description">{filter.description}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="cvd-type-section">
                <h3>Achromatopsia (Monochromacy)</h3>
                <div className="filter-grid">
                  {cvdFilterList.filter(f => f.cvdType === 'Achromatopsia').map((filter) => (
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
                        <span className="cvd-badge">A</span>
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
                      setCurrentTexture('wood');
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

          <div className="control-section">
            <h2>Quick Actions</h2>
            <div className="quick-actions">
              <button 
                className="action-button reset-action"
                onClick={resetAllCustomizations}
              >
                🔄 Reset All Colors
              </button>
              
              <button 
                className="action-button default-action"
                onClick={resetToDefaultWhite}
              >
                ⚪ Reset to Default White
              </button>
              
              <button 
                className="action-button screenshot-action"
                onClick={() => {
                  const canvas = document.querySelector('canvas');
                  if (canvas) {
                    const link = document.createElement('a');
                    link.download = `furniture-${currentModel}-cvd-${Date.now()}.png`;
                    link.href = canvas.toDataURL('image/png');
                    link.click();
                  }
                }}
              >
                📸 Export Screenshot
              </button>
            </div>
          </div>

          <div className="control-section">
            <h2>Section Coloring</h2>
            
            {selectedSection ? (
              <div className="section-info">
                <div className="selected-section">
                  <h3>Selected: <span className="section-name">{selectedSection}</span></h3>
                  <button 
                    className="clear-section-btn"
                    onClick={() => setSelectedSection(null)}
                  >
                    Clear Selection
                  </button>
                </div>
                
                <div className="color-picker">
                  <h4>Choose Color:</h4>
                  <div className="color-grid">
                    {sectionColorPalette.map((color, index) => (
                      <button
                        key={index}
                        className="color-swatch"
                        style={{ backgroundColor: color }}
                        onClick={() => applyColorToSection(color)}
                        title={`Apply ${color} to ${selectedSection}`}
                      />
                    ))}
                  </div>
                  
                  <div className="custom-color">
                    <h4>Custom Color:</h4>
                    <input 
                      type="color"
                      onChange={(e) => applyColorToSection(e.target.value)}
                      style={{ width: '100%', height: '40px' }}
                    />
                  </div>
                  
                  <button 
                    className="reset-section-btn"
                    onClick={() => {
                      setSectionColors(prev => {
                        const newColors = { ...prev };
                        delete newColors[selectedSection];
                        return newColors;
                      });
                      if (modelRef.current && modelRef.current.resetSectionColor) {
                        modelRef.current.resetSectionColor(selectedSection);
                      }
                    }}
                  >
                    Reset to Default
                  </button>
                </div>
              </div>
            ) : (
              <div className="section-selection">
                <p className="section-instruction">
                  Click on any part of the 3D model to select it, then choose a color below.
                </p>
                <div className="predefined-sections">
                  <h4>Quick Select Common Sections:</h4>
                  <div className="section-buttons">
                    <button onClick={() => handleSectionSelect('frame')}>Frame/Legs</button>
                    <button onClick={() => handleSectionSelect('surface')}>Surface/Top</button>
                    <button onClick={() => handleSectionSelect('cushion')}>Cushions</button>
                    <button onClick={() => handleSectionSelect('handle')}>Handles/Knobs</button>
                    <button onClick={() => handleSectionSelect('drawer')}>Drawers</button>
                    <button onClick={() => handleSectionSelect('back')}>Back Rest</button>
                    <button onClick={() => handleSectionSelect('leg')}>Legs</button>
                    <button onClick={() => handleSectionSelect('support')}>Supports</button>
                  </div>
                </div>
                
                {/* Current customizations */}
                {Object.keys(sectionColors).length > 0 && (
                  <div className="current-customizations">
                    <h4>Current Customizations:</h4>
                    <div className="customization-list">
                      {Object.entries(sectionColors).map(([section, color]) => (
                        <div key={section} className="customization-item">
                          <div 
                            className="color-preview"
                            style={{ backgroundColor: color }}
                          />
                          <span className="section-label">{section}</span>
                          <button 
                            className="edit-btn"
                            onClick={() => handleSectionSelect(section)}
                          >
                            Edit
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;