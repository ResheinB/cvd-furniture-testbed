import React, { useState, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, TransformControls, Grid, Environment } from '@react-three/drei';
import * as THREE from 'three';
import FurnitureModel from './components/threejs/FurnitureModel';
import RoomLayout from './components/threejs/RoomLayout';
import './App.css';

function App() {
  const [currentModel, setCurrentModel] = useState('desk');
  const [currentFilter, setCurrentFilter] = useState('white'); // Default to white
  const [currentTexture, setCurrentTexture] = useState('none');
  const [selectedSection, setSelectedSection] = useState(null);
  const [sectionColors, setSectionColors] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [mode, setMode] = useState('customize'); // 'customize' or 'layout'
  const [selectedFurniture, setSelectedFurniture] = useState(null);
  const [transformMode, setTransformMode] = useState('translate');
  
  // Store model customizations per model type
  const [modelCustomizations, setModelCustomizations] = useState({
    'desk': {},
    'chair': {},
    'wardrobe': {},
    'bookshelf': {},
    'bed': {},
    'sofa': {},
    'table': {},
    'cabinet': {},
  });
  
  const [furnitureSizeScale, setFurnitureSizeScale] = useState({
    'desk': 1.0,
    'chair': 1.0,
    'wardrobe': 1.0,
    'bookshelf': 1.0,
    'bed': 1.0,
    'sofa': 1.0,
    'table': 1.0,
    'cabinet': 1.0,
  });

  // Start with empty room in layout mode
  const [furnitureItems, setFurnitureItems] = useState([]);
  
  const modelRef = useRef();
  const transformControlsRef = useRef();

  // Section-specific color palette
  const sectionColorPalette = [
    '#2764AE', '#E0DFDA', '#F28C28', '#F1C40F', '#333333', '#DDDDDD', 
    '#A6764D', '#F5F5F5', '#8A2BE2', '#FF6B6B', '#4ECDC4', '#45B7D1',
    '#D4A76A', '#3C2F2F', '#E1C699', '#FFFFFF', '#808080', '#2196F3',
    '#4CAF50', '#F44336'
  ];

  useEffect(() => {
    console.log('App initialized');
    setIsLoading(false);
    
    // Cleanup function
    return () => {
      if (transformControlsRef.current) {
        transformControlsRef.current.detach();
      }
    };
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't handle if typing in an input
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      
      if (mode === 'layout' && selectedFurniture && transformControlsRef.current) {
        switch(e.key.toLowerCase()) {
          case 'w':
            e.preventDefault();
            transformControlsRef.current.setMode('translate');
            setTransformMode('translate');
            break;
          case 'e':
            e.preventDefault();
            transformControlsRef.current.setMode('rotate');
            setTransformMode('rotate');
            break;
          case 'r':
            e.preventDefault();
            transformControlsRef.current.setMode('scale');
            setTransformMode('scale');
            break;
          case 'delete':
          case 'backspace':
            e.preventDefault();
            removeSelectedFurniture();
            break;
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mode, selectedFurniture]);

  const modelList = [
    { id: 'desk', name: 'Desk', icon: '🪑', normalizedScale: 0.8 },
    { id: 'chair', name: 'Chair', icon: '💺', normalizedScale: 0.8 },
    { id: 'wardrobe', name: 'Wardrobe', icon: '🚪', normalizedScale: 0.7 },
    { id: 'bookshelf', name: 'Bookshelf', icon: '📚', normalizedScale: 0.9 },
    { id: 'bed', name: 'Bed', icon: '🛏️', normalizedScale: 0.5 },
    { id: 'sofa', name: 'Sofa', icon: '🛋️', normalizedScale: 0.6 },
    { id: 'table', name: 'Table', icon: '🍽️', normalizedScale: 0.8 },
    { id: 'cabinet', name: 'Cabinet', icon: '🥘', normalizedScale: 0.8 },
  ];

  // CVD FILTERS ONLY - Always available
  const cvdFilterList = [
    { 
      id: 'white', 
      name: 'Default White', 
      description: 'Clean white finish - default model color',
      color: '#FFFFFF',
      previewColor: 'linear-gradient(135deg, #FFFFFF, #F5F5F5)',
      isCVD: false
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
    { id: 'none', name: 'No Texture', description: 'Solid color only', icon: '🟦' },
    { id: 'wood', name: 'Wood Grain', description: 'Natural wood texture', icon: '🪵' },
    { id: 'marble', name: 'Marble', description: 'Elegant marble texture', icon: '🗿' },
    { id: 'fabric', name: 'Fabric', description: 'Soft fabric texture', icon: '🧵' },
    { id: 'metal', name: 'Metal', description: 'Brushed metal texture', icon: '🔩' },
    { id: 'leather', name: 'Leather', description: 'Genuine leather texture', icon: '🐄' },
    { id: 'concrete', name: 'Concrete', description: 'Industrial concrete texture', icon: '🏗️' },
    { id: 'glass', name: 'Glass', description: 'Transparent glass effect', icon: '🔮' }
  ];

  // Function to handle section selection (only in customize mode)
  const handleSectionSelect = (sectionName) => {
    if (mode === 'customize') {
      setSelectedSection(sectionName);
    }
  };

  // Function to apply color to selected section - UPDATED TO SAVE CUSTOMIZATIONS
  const applyColorToSection = (color) => {
    if (!selectedSection || mode !== 'customize') return;
    
    // Update current section colors
    const newSectionColors = {
      ...sectionColors,
      [selectedSection]: color
    };
    
    setSectionColors(newSectionColors);
    
    // Save to model customizations
    setModelCustomizations(prev => ({
      ...prev,
      [currentModel]: newSectionColors
    }));
    
    if (modelRef.current && modelRef.current.applyColorToSection) {
      modelRef.current.applyColorToSection(selectedSection, color);
    }
  };

  // Quick action: Reset all customizations - UPDATED
  const resetAllCustomizations = () => {
    if (mode === 'customize' && modelRef.current && modelRef.current.resetAllColors) {
      const resetCount = modelRef.current.resetAllColors();
      
      // Clear section colors for current model
      setSectionColors({});
      
      // Clear from model customizations
      setModelCustomizations(prev => ({
        ...prev,
        [currentModel]: {}
      }));
      
      alert(`Reset ${resetCount} customizations`);
    }
  };

  // Quick action: Reset to default white - UPDATED
  const resetToDefaultWhite = () => {
    setCurrentFilter('white');
    if (mode === 'customize' && modelRef.current && modelRef.current.resetAllColors) {
      modelRef.current.resetAllColors();
      
      // Clear section colors for current model
      setSectionColors({});
      
      // Clear from model customizations
      setModelCustomizations(prev => ({
        ...prev,
        [currentModel]: {}
      }));
      
      alert('Reset to default white');
    }
  };

  // Handle model change - UPDATED TO LOAD SAVED CUSTOMIZATIONS
  const handleModelChange = (modelId) => {
    setCurrentModel(modelId);
    setSelectedSection(null);
    
    // Load saved customizations for this model
    const savedCustomizations = modelCustomizations[modelId] || {};
    setSectionColors(savedCustomizations);
  };

  // Handle mode change - UPDATED
  const handleModeChange = (newMode) => {
    setMode(newMode);
    setSelectedSection(null);
    setSelectedFurniture(null);
    
    if (transformControlsRef.current) {
      transformControlsRef.current.detach();
    }
    
    if (newMode === 'layout') {
      console.log('Switching to layout mode');
    } else {
      console.log('Switching to customize mode');
    }
  };

  // Handle furniture selection in layout mode
  const handleFurnitureSelect = (furnitureId) => {
    if (mode === 'layout') {
      if (transformControlsRef.current) {
        transformControlsRef.current.detach(); // Detach from previous
      }
      setSelectedFurniture(furnitureId);
    }
  };

  // Update furniture position - UPDATED FOR DRAG AND DROP
  const updateFurniturePosition = (id, position, rotation, scale) => {
    setFurnitureItems(prev => prev.map(item => 
      item.id === id ? { ...item, position, rotation, scale } : item
    ));
  };

  // Add new furniture item - UPDATED TO SPAWN IN CENTER
  const addFurnitureItem = (type) => {
    const newId = `${type}-${Date.now()}`;
    
    const newItem = {
      id: newId,
      type,
      position: [0, 0, 0], // Spawn in center
      rotation: [0, 0, 0], // Start with no rotation
      scale: furnitureSizeScale[type] || 1,
      normalizedScale: getNormalizedScale(type),
      visible: true
    };
    
    setFurnitureItems(prev => [...prev, newItem]);
    setSelectedFurniture(newId);
  };

  // Remove selected furniture
  const removeSelectedFurniture = () => {
    if (selectedFurniture) {
      setFurnitureItems(prev => prev.filter(item => item.id !== selectedFurniture));
      setSelectedFurniture(null);
      if (transformControlsRef.current) {
        transformControlsRef.current.detach();
      }
    }
  };

  // Toggle furniture visibility
  const toggleFurnitureVisibility = (id) => {
    setFurnitureItems(prev => prev.map(item => 
      item.id === id ? { ...item, visible: !item.visible } : item
    ));
  };

  // Get normalized scale for furniture type (for consistent sizing)
  const getNormalizedScale = (type) => {
    const model = modelList.find(m => m.id === type);
    return model?.normalizedScale || 0.8;
  };

  // Update furniture size scale - UPDATED
  const updateFurnitureSizeScale = (furnitureType, scale) => {
    setFurnitureSizeScale(prev => ({
      ...prev,
      [furnitureType]: scale
    }));
    
    // Update all furniture items of this type
    setFurnitureItems(prev => prev.map(item => 
      item.type === furnitureType ? { ...item, scale } : item
    ));
  };

  // Reset layout - UPDATED
  const resetLayout = () => {
    setFurnitureItems([]);
    setSelectedFurniture(null);
    if (transformControlsRef.current) {
      transformControlsRef.current.detach();
    }
  };

  // Get current normalized scale for customize mode
  const getCurrentNormalizedScale = () => {
    const model = modelList.find(m => m.id === currentModel);
    return model?.normalizedScale || 0.8;
  };

  // Get saved customizations for a model type
  const getCustomizationsForModel = (modelType) => {
    return modelCustomizations[modelType] || {};
  };

  // Clear room (remove all furniture)
  const clearRoom = () => {
    setFurnitureItems([]);
    setSelectedFurniture(null);
    if (transformControlsRef.current) {
      transformControlsRef.current.detach();
    }
  };

  // Handle TransformControls rotation (lock to Y-axis only)
  const handleTransformChange = (e) => {
    if (!e?.target?.object || !selectedFurniture) return;
    
    const selectedItem = furnitureItems.find(f => f.id === selectedFurniture);
    if (!selectedItem) return;
    
    // Update position
    const newPosition = [
      e.target.object.position.x,
      e.target.object.position.y,
      e.target.object.position.z
    ];
    
    // For rotation, only use Y-axis (horizontal rotation)
    let newRotation;
    if (transformMode === 'rotate') {
      // Lock to Y-axis only
      newRotation = [
        0, // Lock X rotation
        e.target.object.rotation.y, // Only allow Y rotation
        0  // Lock Z rotation
      ];
    } else {
      newRotation = [
        e.target.object.rotation.x,
        e.target.object.rotation.y,
        e.target.object.rotation.z
      ];
    }
    
    // Update scale (handle scaling differently)
    let newScale = selectedItem.scale;
    if (transformMode === 'scale') {
      newScale = e.target.object.scale.x;
    }
    
    updateFurniturePosition(selectedFurniture, newPosition, newRotation, newScale);
  };

  if (isLoading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="App">
      <header className="app-header">
        <div className="header-left">
          <h1>3D Furniture CVD Accessibility {mode === 'layout' ? 'Room Layout' : 'Test'}</h1>
          <div className="current-selection">
            <span className="current-mode">Mode: {mode === 'layout' ? 'Room Layout' : 'Customize'}</span>
            {mode === 'customize' && (
              <>
                <span className="current-model">Model: {modelList.find(m => m.id === currentModel)?.name}</span>
                <span className="current-filter">CVD Filter: {cvdFilterList.find(f => f.id === currentFilter)?.name}</span>
                <span className="customization-count">
                  Customizations: {Object.keys(sectionColors).length}
                </span>
              </>
            )}
            {mode === 'layout' && selectedFurniture && (
              <>
                <span className="current-furniture">Selected: {furnitureItems.find(f => f.id === selectedFurniture)?.type}</span>
                <span className="transform-mode">
                  Mode: {transformMode === 'translate' ? 'Move (W)' : 
                         transformMode === 'rotate' ? 'Rotate (E)' : 
                         'Scale (R)'}
                </span>
              </>
            )}
            {mode === 'layout' && (
              <span className="room-item-count">
                Items in room: {furnitureItems.length}
              </span>
            )}
          </div>
        </div>
        <div className="header-right">
          <div className="mode-selector">
            <button 
              className={`mode-button ${mode === 'customize' ? 'active' : ''}`}
              onClick={() => handleModeChange('customize')}
            >
              🎨 Customize Mode
            </button>
            <button 
              className={`mode-button ${mode === 'layout' ? 'active' : ''}`}
              onClick={() => handleModeChange('layout')}
            >
              🏠 Room Layout Mode
            </button>
          </div>
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
              camera={mode === 'layout' ? 
                // 30° angled camera for layout mode
                { 
                  position: [7, 5, 7], // 30° angle position
                  fov: 50,
                  up: [0, 1, 0], // Ensure Y is up
                } : 
                { position: [5, 5, 5], fov: 50 }
              }
              style={{ cursor: mode === 'layout' ? 'move' : 'pointer' }}
              onCreated={({ gl }) => {
                gl.domElement.style.touchAction = 'none';
              }}
            >
              {/* Enhanced Lighting Setup */}
              <ambientLight intensity={1.5} color="#ffffff" />
              <directionalLight 
                position={mode === 'layout' ? [15, 20, 15] : [10, 15, 10]} 
                intensity={1.2}
                castShadow
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

              {mode === 'customize' ? (
                // Customize Mode - Single Model
                <FurnitureModel 
                  currentModel={currentModel} 
                  currentFilter={currentFilter}
                  currentTexture={currentTexture}
                  selectedSection={selectedSection}
                  sectionColors={sectionColors}
                  onSectionSelect={handleSectionSelect}
                  normalizedScale={getCurrentNormalizedScale()}
                  ref={modelRef}
                  mode="customize"
                />
              ) : (
                // Layout Mode - Multiple Models in Room
                <>
                  <RoomLayout />
                  
                  {/* Render all furniture items WITH CUSTOMIZATIONS */}
                  {furnitureItems
                    .filter(item => item.visible)
                    .map((item) => {
                      // Get saved customizations for this furniture type
                      const savedCustomizations = getCustomizationsForModel(item.type);
                      
                      return (
                        <FurnitureModel 
                          key={item.id}
                          currentModel={item.type}
                          currentFilter={currentFilter}
                          currentTexture={currentTexture}
                          position={item.position}
                          rotation={item.rotation}
                          scale={item.scale}
                          normalizedScale={item.normalizedScale * furnitureSizeScale[item.type]}
                          sectionColors={savedCustomizations} // Pass saved customizations
                          onClick={() => handleFurnitureSelect(item.id)}
                          isSelected={selectedFurniture === item.id}
                          mode="layout"
                        />
                      );
                    })}
                  
                  {/* Transform controls for selected furniture */}
                  {selectedFurniture && (
                    <TransformControls
                      ref={transformControlsRef}
                      mode={transformMode}
                      onObjectChange={handleTransformChange}
                      onChange={() => {
                        // Update transform mode when user changes it via UI
                        if (transformControlsRef.current) {
                          setTransformMode(transformControlsRef.current.mode);
                        }
                      }}
                    >
                      {/* This creates an empty group that TransformControls will control */}
                      <group 
                        position={selectedFurniture ? furnitureItems.find(f => f.id === selectedFurniture)?.position || [0,0,0] : [0,0,0]}
                        rotation={selectedFurniture ? furnitureItems.find(f => f.id === selectedFurniture)?.rotation || [0,0,0] : [0,0,0]}
                        scale={selectedFurniture ? furnitureItems.find(f => f.id === selectedFurniture)?.scale || 1 : 1}
                        ref={(el) => {
                          if (el && transformControlsRef.current) {
                            transformControlsRef.current.attach(el);
                          }
                        }}
                      />
                    </TransformControls>
                  )}
                  
                  {/* Grid for alignment */}
                  <Grid
                    args={[20, 20]}
                    cellSize={0.5}
                    cellThickness={0.3}
                    cellColor="#6f6f6f"
                    sectionSize={2.5}
                    sectionThickness={0.5}
                    sectionColor="#9d4b4b"
                    fadeDistance={30}
                    fadeStrength={1}
                    position={[0, 0.01, 0]}
                  />
                  
                  {/* Center marker for spawn point */}
                  {furnitureItems.length === 0 && (
                    <mesh position={[0, 0.02, 0]} rotation={[-Math.PI/2, 0, 0]}>
                      <ringGeometry args={[0.2, 0.3, 16]} />
                      <meshBasicMaterial 
                        color="#4299e1" 
                        transparent 
                        opacity={0.5}
                        side={THREE.DoubleSide}
                      />
                    </mesh>
                  )}
                </>
              )}
              
              <OrbitControls 
                enableZoom={true} 
                enablePan={true}
                enableRotate={true}
                minDistance={mode === 'layout' ? 3 : 2}
                maxDistance={mode === 'layout' ? 20 : 15}
                maxPolarAngle={mode === 'layout' ? Math.PI / 2 : Math.PI} // Limit to top-down view in layout
                minPolarAngle={mode === 'layout' ? Math.PI / 4 : 0} // Keep 30° minimum angle
              />
              
              {/* Show axes helper in layout mode */}
              {mode === 'layout' && <axesHelper args={[2]} />}
            </Canvas>
          </div>
        </div>
        
        <div className="control-panel">
          {mode === 'customize' ? (
            // Customize Mode Controls
            <>
              <div className="control-section">
                <h2>Select Furniture Model</h2>
                <div className="model-selector">
                  <div className="model-grid">
                    {modelList.map((model) => {
                      const customCount = Object.keys(modelCustomizations[model.id] || {}).length;
                      return (
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
                            <span className="model-scale">Size: {(model.normalizedScale * 100).toFixed(0)}%</span>
                            {customCount > 0 && (
                              <span className="model-custom-count">
                                {customCount} customization{customCount !== 1 ? 's' : ''}
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="control-section">
                <h2>CVD Accessibility Colors</h2>
                <div className="filter-section">
                  <p className="cvd-description">
                    Colors optimized for different types of Color Vision Deficiency (CVD)
                  </p>
                  
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
                          // Remove from current section colors
                          const newSectionColors = { ...sectionColors };
                          delete newSectionColors[selectedSection];
                          setSectionColors(newSectionColors);
                          
                          // Update model customizations
                          setModelCustomizations(prev => ({
                            ...prev,
                            [currentModel]: newSectionColors
                          }));
                          
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
            </>
          ) : (
            // Layout Mode Controls - UPDATED
            <>
              <div className="control-section">
                <h2>Furniture Palette</h2>
                <div className="furniture-palette">
                  <p className="palette-instruction">
                    Click on a furniture item to add it to the room center
                  </p>
                  
                  <div className="palette-grid">
                    {modelList.map((model) => {
                      const customCount = Object.keys(getCustomizationsForModel(model.id)).length;
                      return (
                        <button
                          key={model.id}
                          className="palette-item"
                          onClick={() => addFurnitureItem(model.id)}
                          title={`Add ${model.name} to room`}
                        >
                          <div className="palette-icon">
                            {model.icon}
                          </div>
                          <div className="palette-info">
                            <strong>{model.name}</strong>
                            {customCount > 0 && (
                              <span className="palette-custom-count">
                                {customCount} custom
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  
                  <div className="palette-actions">
                    <button 
                      className="palette-action-button clear-room"
                      onClick={clearRoom}
                    >
                      🗑️ Clear Room
                    </button>
                    <button 
                      className="palette-action-button reset-room"
                      onClick={resetLayout}
                    >
                      🔄 Reset Layout
                    </button>
                  </div>
                </div>
              </div>

              <div className="control-section">
                <h2>Room Items ({furnitureItems.length})</h2>
                <div className="furniture-list">
                  {furnitureItems.length === 0 ? (
                    <div className="empty-room">
                      <p>Room is empty</p>
                      <p className="empty-hint">Add furniture from the palette above</p>
                    </div>
                  ) : (
                    furnitureItems.map((item) => {
                      const customCount = Object.keys(getCustomizationsForModel(item.type)).length;
                      return (
                        <div 
                          key={item.id} 
                          className={`furniture-item ${selectedFurniture === item.id ? 'selected' : ''}`}
                          onClick={() => handleFurnitureSelect(item.id)}
                        >
                          <div className="furniture-info">
                            <div className="furniture-icon">
                              {modelList.find(m => m.id === item.type)?.icon || '🪑'}
                            </div>
                            <div className="furniture-details">
                              <strong>{modelList.find(m => m.id === item.type)?.name || item.type}</strong>
                              <span className="furniture-position">
                                Position: [{item.position[0].toFixed(1)}, {item.position[2].toFixed(1)}]
                              </span>
                              <span className="furniture-scale">
                                Scale: {(item.scale * 100).toFixed(0)}%
                              </span>
                              {customCount > 0 && (
                                <span className="furniture-custom-count">
                                  {customCount} customization{customCount !== 1 ? 's' : ''}
                                </span>
                              )}
                            </div>
                            <div className="furniture-actions">
                              <button 
                                className="visibility-toggle"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleFurnitureVisibility(item.id);
                                }}
                                title={item.visible ? 'Hide' : 'Show'}
                              >
                                {item.visible ? '👁️' : '👁️‍🗨️'}
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="control-section">
                <h2>Transform Controls</h2>
                <div className="transform-controls">
                  <p className={`transform-instruction ${selectedFurniture ? 'selected' : ''}`}>
                    {selectedFurniture 
                      ? `Selected: ${furnitureItems.find(f => f.id === selectedFurniture)?.type}`
                      : 'Click on a furniture item in the room to select it'}
                  </p>
                  <div className="transform-buttons">
                    <button 
                      className={`transform-button ${selectedFurniture ? '' : 'disabled'}`}
                      onClick={() => {
                        if (selectedFurniture && transformControlsRef.current) {
                          transformControlsRef.current.setMode('translate');
                          setTransformMode('translate');
                        }
                      }}
                      disabled={!selectedFurniture}
                    >
                      ↔️ Move (W)
                    </button>
                    <button 
                      className={`transform-button ${selectedFurniture ? '' : 'disabled'}`}
                      onClick={() => {
                        if (selectedFurniture && transformControlsRef.current) {
                          transformControlsRef.current.setMode('rotate');
                          setTransformMode('rotate');
                        }
                      }}
                      disabled={!selectedFurniture}
                      title="Horizontal rotation only (Y-axis)"
                    >
                      🔄 Rotate (E)
                    </button>
                    <button 
                      className={`transform-button ${selectedFurniture ? '' : 'disabled'}`}
                      onClick={() => {
                        if (selectedFurniture && transformControlsRef.current) {
                          transformControlsRef.current.setMode('scale');
                          setTransformMode('scale');
                        }
                      }}
                      disabled={!selectedFurniture}
                    >
                      ⚖️ Scale (R)
                    </button>
                  </div>
                  <p className="transform-tip">
                    Tip: Use W, E, R keys to switch between Move, Rotate, and Scale modes
                  </p>
                  <p className="rotation-tip">
                    <small>Rotation is locked to horizontal (Y-axis) only</small>
                  </p>
                </div>
              </div>

              <div className="control-section">
                <h2>Room Settings</h2>
                <div className="room-settings">
                  <div className="setting-group">
                    <label>CVD Filter for All Furniture:</label>
                    <select 
                      value={currentFilter}
                      onChange={(e) => setCurrentFilter(e.target.value)}
                      className="filter-select"
                    >
                      {cvdFilterList.map(filter => (
                        <option key={filter.id} value={filter.id}>
                          {filter.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="setting-group">
                    <label>Texture for All Furniture:</label>
                    <select 
                      value={currentTexture}
                      onChange={(e) => setCurrentTexture(e.target.value)}
                      className="texture-select"
                    >
                      {textureList.map(texture => (
                        <option key={texture.id} value={texture.id}>
                          {texture.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="setting-group">
                    <button 
                      className="action-button screenshot-action"
                      onClick={() => {
                        const canvas = document.querySelector('canvas');
                        if (canvas) {
                          const link = document.createElement('a');
                          link.download = `room-layout-cvd-${Date.now()}.png`;
                          link.href = canvas.toDataURL('image/png');
                          link.click();
                        }
                      }}
                    >
                      📸 Export Room Layout
                    </button>
                  </div>
                </div>
              </div>

              {/* Furniture Size Controls Section */}
              <div className="control-section">
                <h2>Furniture Size Controls</h2>
                <div className="size-controls">
                  <p className="size-instruction">
                    Adjust the size of each furniture type. Changes apply to all items of that type.
                  </p>
                  
                  <div className="size-sliders">
                    {/* Desk Size */}
                    <div className="size-slider-group">
                      <div className="slider-header">
                        <span className="slider-label">Desk Size</span>
                        <span className="slider-value">{(furnitureSizeScale['desk'] * 100).toFixed(0)}%</span>
                      </div>
                      <input
                        type="range"
                        min="0.5"
                        max="2.0"
                        step="0.1"
                        value={furnitureSizeScale['desk']}
                        onChange={(e) => updateFurnitureSizeScale('desk', parseFloat(e.target.value))}
                        className="size-slider"
                      />
                      <div className="slider-ticks">
                        <span>Small</span>
                        <span>Medium</span>
                        <span>Large</span>
                      </div>
                    </div>

                    {/* Chair Size */}
                    <div className="size-slider-group">
                      <div className="slider-header">
                        <span className="slider-label">Chair Size</span>
                        <span className="slider-value">{(furnitureSizeScale['chair'] * 100).toFixed(0)}%</span>
                      </div>
                      <input
                        type="range"
                        min="0.5"
                        max="2.0"
                        step="0.1"
                        value={furnitureSizeScale['chair']}
                        onChange={(e) => updateFurnitureSizeScale('chair', parseFloat(e.target.value))}
                        className="size-slider"
                      />
                      <div className="slider-ticks">
                        <span>Small</span>
                        <span>Medium</span>
                        <span>Large</span>
                      </div>
                    </div>

                    {/* Wardrobe Size */}
                    <div className="size-slider-group">
                      <div className="slider-header">
                        <span className="slider-label">Wardrobe Size</span>
                        <span className="slider-value">{(furnitureSizeScale['wardrobe'] * 100).toFixed(0)}%</span>
                      </div>
                      <input
                        type="range"
                        min="0.5"
                        max="2.0"
                        step="0.1"
                        value={furnitureSizeScale['wardrobe']}
                        onChange={(e) => updateFurnitureSizeScale('wardrobe', parseFloat(e.target.value))}
                        className="size-slider"
                      />
                      <div className="slider-ticks">
                        <span>Small</span>
                        <span>Medium</span>
                        <span>Large</span>
                      </div>
                    </div>

                    {/* Bookshelf Size */}
                    <div className="size-slider-group">
                      <div className="slider-header">
                        <span className="slider-label">Bookshelf Size</span>
                        <span className="slider-value">{(furnitureSizeScale['bookshelf'] * 100).toFixed(0)}%</span>
                      </div>
                      <input
                        type="range"
                        min="0.5"
                        max="2.0"
                        step="0.1"
                        value={furnitureSizeScale['bookshelf']}
                        onChange={(e) => updateFurnitureSizeScale('bookshelf', parseFloat(e.target.value))}
                        className="size-slider"
                      />
                      <div className="slider-ticks">
                        <span>Small</span>
                        <span>Medium</span>
                        <span>Large</span>
                      </div>
                    </div>

                    {/* Bed Size */}
                    <div className="size-slider-group">
                      <div className="slider-header">
                        <span className="slider-label">Bed Size</span>
                        <span className="slider-value">{(furnitureSizeScale['bed'] * 100).toFixed(0)}%</span>
                      </div>
                      <input
                        type="range"
                        min="0.5"
                        max="2.0"
                        step="0.1"
                        value={furnitureSizeScale['bed']}
                        onChange={(e) => updateFurnitureSizeScale('bed', parseFloat(e.target.value))}
                        className="size-slider"
                      />
                      <div className="slider-ticks">
                        <span>Small</span>
                        <span>Medium</span>
                        <span>Large</span>
                      </div>
                    </div>

                    {/* Sofa Size */}
                    <div className="size-slider-group">
                      <div className="slider-header">
                        <span className="slider-label">Sofa Size</span>
                        <span className="slider-value">{(furnitureSizeScale['sofa'] * 100).toFixed(0)}%</span>
                      </div>
                      <input
                        type="range"
                        min="0.5"
                        max="2.0"
                        step="0.1"
                        value={furnitureSizeScale['sofa']}
                        onChange={(e) => updateFurnitureSizeScale('sofa', parseFloat(e.target.value))}
                        className="size-slider"
                      />
                      <div className="slider-ticks">
                        <span>Small</span>
                        <span>Medium</span>
                        <span>Large</span>
                      </div>
                    </div>

                    {/* Table Size */}
                    <div className="size-slider-group">
                      <div className="slider-header">
                        <span className="slider-label">Table Size</span>
                        <span className="slider-value">{(furnitureSizeScale['table'] * 100).toFixed(0)}%</span>
                      </div>
                      <input
                        type="range"
                        min="0.5"
                        max="2.0"
                        step="0.1"
                        value={furnitureSizeScale['table']}
                        onChange={(e) => updateFurnitureSizeScale('table', parseFloat(e.target.value))}
                        className="size-slider"
                      />
                      <div className="slider-ticks">
                        <span>Small</span>
                        <span>Medium</span>
                        <span>Large</span>
                      </div>
                    </div>

                    {/* Cabinet Size */}
                    <div className="size-slider-group">
                      <div className="slider-header">
                        <span className="slider-label">Cabinet Size</span>
                        <span className="slider-value">{(furnitureSizeScale['cabinet'] * 100).toFixed(0)}%</span>
                      </div>
                      <input
                        type="range"
                        min="0.5"
                        max="2.0"
                        step="0.1"
                        value={furnitureSizeScale['cabinet']}
                        onChange={(e) => updateFurnitureSizeScale('cabinet', parseFloat(e.target.value))}
                        className="size-slider"
                      />
                      <div className="slider-ticks">
                        <span>Small</span>
                        <span>Medium</span>
                        <span>Large</span>
                      </div>
                    </div>
                  </div>

                  {/* Quick Size Presets */}
                  <div className="size-presets">
                    <h4>Quick Presets:</h4>
                    <div className="preset-buttons">
                      <button 
                        className="preset-button"
                        onClick={() => {
                          const presets = {
                            'desk': 0.8,
                            'chair': 0.8,
                            'wardrobe': 0.8,
                            'bookshelf': 0.8,
                            'bed': 0.8,
                            'sofa': 0.8,
                            'table': 0.8,
                            'cabinet': 0.8,
                          };
                          Object.keys(presets).forEach(type => {
                            updateFurnitureSizeScale(type, presets[type]);
                          });
                        }}
                      >
                        Reset All to Default
                      </button>
                      <button 
                        className="preset-button"
                        onClick={() => {
                          const presets = {
                            'desk': 0.6,
                            'chair': 0.6,
                            'wardrobe': 0.6,
                            'bookshelf': 0.6,
                            'bed': 0.6,
                            'sofa': 0.6,
                            'table': 0.6,
                            'cabinet': 0.6,
                          };
                          Object.keys(presets).forEach(type => {
                            updateFurnitureSizeScale(type, presets[type]);
                          });
                        }}
                      >
                        Small Room
                      </button>
                      <button 
                        className="preset-button"
                        onClick={() => {
                          const presets = {
                            'desk': 1.2,
                            'chair': 1.2,
                            'wardrobe': 1.2,
                            'bookshelf': 1.2,
                            'bed': 1.2,
                            'sofa': 1.2,
                            'table': 1.2,
                            'cabinet': 1.2,
                          };
                          Object.keys(presets).forEach(type => {
                            updateFurnitureSizeScale(type, presets[type]);
                          });
                        }}
                      >
                        Large Room
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;