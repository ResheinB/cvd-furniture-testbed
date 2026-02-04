/**
 * Main application component for 3D Furniture CVD Accessibility Simulator
 * 
 * Features:
 * - Two modes: Customize (color individual furniture parts) and Layout (arrange furniture in room)
 * - Scientific CVD (Color Vision Deficiency) simulation filters
 * - Real-time 3D furniture manipulation with Three.js
 * - Interactive color customization for furniture sections
 * - Furniture layout with drag & drop, rotation, and scaling
 * - Texture application (wood, marble, fabric, metal, etc.)
 * - Post-processing effects for CVD simulation
 * 
 * Key Components:
 * - React Three Fiber for 3D rendering
 * - TransformControls for furniture manipulation
 * - CVD post-processing shaders
 * - Mode switching between customize and layout
 * - Persistent furniture customizations
 */

import React, { useState, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, TransformControls, Grid, Environment } from '@react-three/drei';
import * as THREE from 'three';
import FurnitureModel from './components/threejs/FurnitureModel';
import RoomLayout from './components/threejs/RoomLayout';
import CVDPostProcessing from './components/threejs/CVDPostProcessing';
import './App.css';

function App() {
   // ========== STATE MANAGEMENT ==========
  
  const [currentModel, setCurrentModel] = useState('desk');
  const [currentFilter, setCurrentFilter] = useState('none');
  const [currentTexture, setCurrentTexture] = useState('none');
  const [selectedSection, setSelectedSection] = useState(null);
  const [sectionColors, setSectionColors] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [mode, setMode] = useState('customize');
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
   // Furniture items currently in the room (layout mode)
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
  
  // Refs for controls
  const orbitControlsRef = useRef();
  const transformControlsRef = useRef();
  const modelRef = useRef();
  
  // State to track if transform controls are active
  const [isTransforming, setIsTransforming] = useState(false);
  
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

  // SCIENTIFIC CVD SIMULATION MATRICES (Brettel, Viénot & Mollon, 1997)
  const cvdSimulationFilters = [
    { 
      id: 'none', 
      name: 'No Filter', 
      description: 'Normal color vision',
      type: 'none',
      matrix: [
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
      ],
      prevalence: 'Normal vision',
      severity: 'N/A'
    },
    { 
      id: 'protanopia', 
      name: 'Protanopia', 
      description: 'Cannot perceive red light (red cones missing)',
      type: 'protanopia',
      matrix: [
        0.567, 0.433, 0, 0,
        0.558, 0.442, 0, 0,
        0, 0.242, 0.758, 0,
        0, 0, 0, 1
      ],
      prevalence: '1% of males',
      severity: 'Severe'
    },
    { 
      id: 'protanomaly', 
      name: 'Protanomaly', 
      description: 'Reduced sensitivity to red light (red cones abnormal)',
      type: 'protanomaly',
      matrix: [
        0.817, 0.183, 0, 0,
        0.333, 0.667, 0, 0,
        0, 0.125, 0.875, 0,
        0, 0, 0, 1
      ],
      prevalence: '1% of males',
      severity: 'Mild'
    },
    { 
      id: 'deuteranopia', 
      name: 'Deuteranopia', 
      description: 'Cannot perceive green light (green cones missing)',
      type: 'deuteranopia',
      matrix: [
        0.625, 0.375, 0, 0,
        0.7, 0.3, 0, 0,
        0, 0.3, 0.7, 0,
        0, 0, 0, 1
      ],
      prevalence: '1% of males',
      severity: 'Severe'
    },
    { 
      id: 'deuteranomaly', 
      name: 'Deuteranomaly', 
      description: 'Reduced sensitivity to green light (green cones abnormal)',
      type: 'deuteranomaly',
      matrix: [
        0.8, 0.2, 0, 0,
        0.258, 0.742, 0, 0,
        0, 0.142, 0.858, 0,
        0, 0, 0, 1
      ],
      prevalence: '5% of males',
      severity: 'Mild'
    },
    { 
      id: 'tritanopia', 
      name: 'Tritanopia', 
      description: 'Cannot perceive blue light (blue cones missing)',
      type: 'tritanopia',
      matrix: [
        0.95, 0.05, 0, 0,
        0, 0.433, 0.567, 0,
        0, 0.475, 0.525, 0,
        0, 0, 0, 1
      ],
      prevalence: '0.01% of population',
      severity: 'Severe'
    },
    { 
      id: 'tritanomaly', 
      name: 'Tritanomaly', 
      description: 'Reduced sensitivity to blue light (blue cones abnormal)',
      type: 'tritanomaly',
      matrix: [
        0.967, 0.033, 0, 0,
        0, 0.733, 0.267, 0,
        0, 0.183, 0.817, 0,
        0, 0, 0, 1
      ],
      prevalence: '0.01% of population',
      severity: 'Mild'
    },
    { 
      id: 'achromatopsia', 
      name: 'Achromatopsia', 
      description: 'Complete color blindness (all cones missing)',
      type: 'achromatopsia',
      matrix: [
        0.299, 0.587, 0.114, 0,
        0.299, 0.587, 0.114, 0,
        0.299, 0.587, 0.114, 0,
        0, 0, 0, 1
      ],
      prevalence: '0.003% of population',
      severity: 'Complete'
    },
    { 
      id: 'achromatomaly', 
      name: 'Achromatomaly', 
      description: 'Partial color blindness (reduced color vision)',
      type: 'achromatomaly',
      matrix: [
        0.618, 0.320, 0.062, 0,
        0.163, 0.775, 0.062, 0,
        0.163, 0.320, 0.516, 0,
        0, 0, 0, 1
      ],
      prevalence: '0.001% of population',
      severity: 'Partial'
    }
  ];

  // ========== TEXTURE OPTIONS ==========
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
// ========== FURNITURE MODELS ==========
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

  // ========== KEYBOARD SHORTCUTS ==========
  /**
   * Keyboard controls for layout mode:
   * - W: Translate mode
   * - E: Rotate mode (Y-axis only)
   * - R: Scale mode
   * - ESC: Deselect furniture
   * - DELETE: Remove selected furniture
   */
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      
      // Escape key to deselect
      if (e.key === 'Escape' && selectedFurniture) {
        e.preventDefault();
        handleDeselect();
        return;
      }
      
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
            handleDeselect();
            break;
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mode, selectedFurniture]);

   // ========== CURSOR MANAGEMENT ==========
  /**
   * Updates cursor based on current state:
   * - Default: grab (for orbiting camera)
   * - Transforming: move/grab/nwse-resize based on transform mode
   */
  useEffect(() => {
    if (mode === 'layout') {
      if (isTransforming) {
        document.body.style.cursor = transformMode === 'translate' ? 'move' : 
                                     transformMode === 'rotate' ? 'grab' : 
                                     'nwse-resize';
      } else {
        document.body.style.cursor = 'grab';
      }
    } else {
      document.body.style.cursor = 'default';
    }
  }, [mode, isTransforming, transformMode]);

  // Function to handle section selection (only in customize mode)
  const handleSectionSelect = (sectionName) => {
    if (mode === 'customize') {
      setSelectedSection(sectionName);
    }
  };

  // Function to apply color to selected section
  const applyColorToSection = (color) => {
    if (!selectedSection || mode !== 'customize') return;
    
    const newSectionColors = {
      ...sectionColors,
      [selectedSection]: color
    };
    
    setSectionColors(newSectionColors);
    
    setModelCustomizations(prev => ({
      ...prev,
      [currentModel]: newSectionColors
    }));
    
    if (modelRef.current && modelRef.current.applyColorToSection) {
      modelRef.current.applyColorToSection(selectedSection, color);
    }
  };

  // Quick action: Reset all customizations
  const resetAllCustomizations = () => {
    if (mode === 'customize' && modelRef.current && modelRef.current.resetAllColors) {
      const resetCount = modelRef.current.resetAllColors();
      
      setSectionColors({});
      
      setModelCustomizations(prev => ({
        ...prev,
        [currentModel]: {}
      }));
      
      alert(`Reset ${resetCount} customizations`);
    }
  };

  // Quick action: Reset to default
  const resetToDefault = () => {
    setCurrentFilter('none');
    if (mode === 'customize' && modelRef.current && modelRef.current.resetAllColors) {
      modelRef.current.resetAllColors();
      
      setSectionColors({});
      
      setModelCustomizations(prev => ({
        ...prev,
        [currentModel]: {}
      }));
      
      alert('Reset to default');
    }
  };

  // Handle model change
  const handleModelChange = (modelId) => {
    setCurrentModel(modelId);
    setSelectedSection(null);
    
    const savedCustomizations = modelCustomizations[modelId] || {};
    setSectionColors(savedCustomizations);
  };

  // Handle mode change
  const handleModeChange = (newMode) => {
    setMode(newMode);
    setSelectedSection(null);
    handleDeselect();
    
    if (transformControlsRef.current) {
      transformControlsRef.current.detach();
    }
  };

  // Handle furniture selection in layout mode
  const handleFurnitureSelect = (furnitureId) => {
    if (mode === 'layout') {
      // If clicking the same item, deselect it
      if (selectedFurniture === furnitureId) {
        handleDeselect();
        return;
      }
      
      // Enable transform controls for selected furniture
      setSelectedFurniture(furnitureId);
      setIsTransforming(true);
      
      // Disable orbit controls when transforming
      if (orbitControlsRef.current) {
        orbitControlsRef.current.enabled = false;
      }
    }
  };

  // Handle deselection
  const handleDeselect = () => {
    setSelectedFurniture(null);
    setIsTransforming(false);
    
    // Re-enable orbit controls
    if (orbitControlsRef.current) {
      orbitControlsRef.current.enabled = true;
    }
    
    // Detach transform controls
    if (transformControlsRef.current) {
      transformControlsRef.current.detach();
    }
  };

  // Handle click on canvas background (deselect)
  const handleCanvasClick = (event) => {
    // Only handle if we clicked on the background (not a furniture item)
    // and we have something selected
    if (mode === 'layout' && selectedFurniture) {
      // Check if we clicked on nothing or the room/floor
      if (!event.object || 
          event.object.name === 'room' || 
          event.object.name === 'floor' ||
          event.object.name === 'grid') {
        handleDeselect();
      }
    }
  };

  // Handle TransformControls events
  const handleTransformStart = () => {
    // Disable orbit controls when transforming starts
    if (orbitControlsRef.current) {
      orbitControlsRef.current.enabled = false;
    }
    setIsTransforming(true);
  };

  const handleTransformChange = (e) => {
    if (!e?.target?.object || !selectedFurniture) return;
    
    const selectedItem = furnitureItems.find(f => f.id === selectedFurniture);
    if (!selectedItem) return;
    
    const newPosition = [
      e.target.object.position.x,
      e.target.object.position.y,
      e.target.object.position.z
    ];
    
    let newRotation;
    if (transformMode === 'rotate') {
      newRotation = [
        0,
        e.target.object.rotation.y,
        0
      ];
    } else {
      newRotation = [
        e.target.object.rotation.x,
        e.target.object.rotation.y,
        e.target.object.rotation.z
      ];
    }
    
    let newScale = selectedItem.scale;
    if (transformMode === 'scale') {
      newScale = e.target.object.scale.x;
    }
    
    updateFurniturePosition(selectedFurniture, newPosition, newRotation, newScale);
  };

  const handleTransformEnd = () => {
    // Transform ended, but we're still selected
    // Orbit controls remain disabled
  };

  // Update furniture position
  const updateFurniturePosition = (id, position, rotation, scale) => {
    setFurnitureItems(prev => prev.map(item => 
      item.id === id ? { ...item, position, rotation, scale } : item
    ));
  };

  // Add new furniture item
  const addFurnitureItem = (type) => {
    const newId = `${type}-${Date.now()}`;
    
    const newItem = {
      id: newId,
      type,
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      scale: furnitureSizeScale[type] || 1,
      normalizedScale: getNormalizedScale(type),
      visible: true
    };
    
    setFurnitureItems(prev => [...prev, newItem]);
    handleFurnitureSelect(newId); // Select the new item
  };

  // Remove selected furniture
  const removeSelectedFurniture = () => {
    if (selectedFurniture) {
      setFurnitureItems(prev => prev.filter(item => item.id !== selectedFurniture));
      handleDeselect();
    }
  };

  // Toggle furniture visibility
  const toggleFurnitureVisibility = (id) => {
    setFurnitureItems(prev => prev.map(item => 
      item.id === id ? { ...item, visible: !item.visible } : item
    ));
  };

  // Get normalized scale for furniture type
  const getNormalizedScale = (type) => {
    const model = modelList.find(m => m.id === type);
    return model?.normalizedScale || 0.8;
  };

  // Update furniture size scale
  const updateFurnitureSizeScale = (furnitureType, scale) => {
    setFurnitureSizeScale(prev => ({
      ...prev,
      [furnitureType]: scale
    }));
    
    setFurnitureItems(prev => prev.map(item => 
      item.type === furnitureType ? { ...item, scale } : item
    ));
  };

  // Reset layout
  const resetLayout = () => {
    setFurnitureItems([]);
    handleDeselect();
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

  // Clear room
  const clearRoom = () => {
    setFurnitureItems([]);
    handleDeselect();
  };

  // Handle filter change
  const handleFilterChange = (filterId) => {
    setCurrentFilter(filterId);
  };

  const getCurrentFilterDescription = () => {
    const filter = cvdSimulationFilters.find(f => f.id === currentFilter);
    return filter ? filter.description : '';
  };

  const getCurrentFilterMatrix = () => {
    const filter = cvdSimulationFilters.find(f => f.id === currentFilter);
    return filter ? filter.matrix : cvdSimulationFilters[0].matrix;
  };

  const getCurrentFilterInfo = () => {
    const filter = cvdSimulationFilters.find(f => f.id === currentFilter);
    return filter ? filter : null;
  };

  if (isLoading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="App">
      <header className="app-header">
        <div className="header-left">
          <h1>3D Furniture CVD Accessibility Simulator</h1>
          <div className="current-selection">
            <span className="current-mode">Mode: {mode === 'layout' ? 'Room Layout' : 'Customize'}</span>
            {mode === 'customize' && (
              <>
                <span className="current-model">Model: {modelList.find(m => m.id === currentModel)?.name}</span>
                <span className="current-filter">
                  CVD Filter: {cvdSimulationFilters.find(f => f.id === currentFilter)?.name}
                </span>
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
            <span className="cvd-badge-large">CVD SIMULATOR</span>
            <span className={`cvd-status ${currentFilter !== 'none' ? 'active' : 'inactive'}`}>
              {currentFilter !== 'none' ? 'ACTIVE' : 'INACTIVE'}
            </span>
          </div>
        </div>
      </header>
      
      <div className="main-container">
        <div className="scene-container">
          <div className="canvas-wrapper">
            <Canvas 
              camera={mode === 'layout' ? 
                { 
                  position: [7, 5, 7],
                  fov: 50,
                  up: [0, 1, 0],
                } : 
                { position: [5, 5, 5], fov: 50 }
              }
              style={{ 
                cursor: isTransforming ? 
                  (transformMode === 'translate' ? 'move' : 
                   transformMode === 'rotate' ? 'grab' : 
                   'nwse-resize') : 'grab' 
              }}
              onClick={handleCanvasClick}
              onPointerMissed={handleDeselect}
              onCreated={({ gl }) => {
                gl.domElement.style.touchAction = 'none';
              }}
            >
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
                <>
                  <RoomLayout />
                  
                  {/* Render furniture items */}
                  {furnitureItems
                    .filter(item => item.visible)
                    .map((item) => {
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
                          sectionColors={savedCustomizations}
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
                      onMouseDown={handleTransformStart}
                      onMouseUp={handleTransformEnd}
                      onChange={() => {
                        if (transformControlsRef.current) {
                          setTransformMode(transformControlsRef.current.mode);
                        }
                      }}
                      enabled={isTransforming}
                    />
                  )}
                  
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
              
              {/* Orbit Controls - Disabled when transforming */}
              <OrbitControls 
                ref={orbitControlsRef}
                enableZoom={true} 
                enablePan={true}
                enableRotate={true}
                minDistance={mode === 'layout' ? 3 : 2}
                maxDistance={mode === 'layout' ? 20 : 15}
                maxPolarAngle={mode === 'layout' ? Math.PI / 2 : Math.PI}
                minPolarAngle={mode === 'layout' ? Math.PI / 4 : 0}
                enabled={!isTransforming}
              />
              
              {mode === 'layout' && <axesHelper args={[2]} />}
              
              {/* CVD Post Processing */}
              {currentFilter !== 'none' && (
                <CVDPostProcessing 
                  filterType={currentFilter}
                  filterMatrix={getCurrentFilterMatrix()}
                />
              )}
            </Canvas>
          </div>
          
          {/* Selection instructions */}
          {mode === 'layout' && (
            <div className="selection-instructions">
              {selectedFurniture ? (
                <div className="transform-instructions">
                  <div className="instruction-item">
                    <span className="instruction-key">W</span>
                    <span className="instruction-text">Move</span>
                  </div>
                  <div className="instruction-item">
                    <span className="instruction-key">E</span>
                    <span className="instruction-text">Rotate</span>
                  </div>
                  <div className="instruction-item">
                    <span className="instruction-key">R</span>
                    <span className="instruction-text">Scale</span>
                  </div>
                  <div className="instruction-item">
                    <span className="instruction-key">ESC</span>
                    <span className="instruction-text">Deselect</span>
                  </div>
                  <div className="instruction-item">
                    <span className="instruction-key">DEL</span>
                    <span className="instruction-text">Delete</span>
                  </div>
                </div>
              ) : (
                <div className="selection-hint">
                  <span className="hint-icon">👆</span>
                  <span className="hint-text">Click on furniture to select</span>
                </div>
              )}
            </div>
          )}
          
          {/* CVD Information Panel */}
          {currentFilter !== 'none' && (
            <div className="cvd-info-panel">
              <div className="cvd-info-header">
                <h4>
                  <span className="cvd-status-dot"></span>
                  CVD Simulation Active
                </h4>
                <button 
                  className="cvd-info-close"
                  onClick={() => setCurrentFilter('none')}
                >
                  ✕
                </button>
              </div>
              <div className="cvd-info-content">
                <h5>{getCurrentFilterInfo()?.name}</h5>
                <p>{getCurrentFilterInfo()?.description}</p>
                <div className="cvd-stats">
                  <div className="cvd-stat">
                    <span className="cvd-stat-label">Prevalence:</span>
                    <span className="cvd-stat-value">{getCurrentFilterInfo()?.prevalence}</span>
                  </div>
                  <div className="cvd-stat">
                    <span className="cvd-stat-label">Severity:</span>
                    <span className="cvd-stat-value">{getCurrentFilterInfo()?.severity}</span>
                  </div>
                </div>
                <div className="cvd-color-test">
                  <div className="cvd-test-row">
                    <span className="cvd-test-label">Normal Vision:</span>
                    <div className="cvd-test-colors">
                      <div className="cvd-test-color red"></div>
                      <div className="cvd-test-color green"></div>
                      <div className="cvd-test-color blue"></div>
                      <div className="cvd-test-color yellow"></div>
                    </div>
                  </div>
                  <div className="cvd-test-row">
                    <span className="cvd-test-label">Simulated View:</span>
                    <div className="cvd-test-colors">
                      <div className={`cvd-test-color red simulated ${currentFilter}`}></div>
                      <div className={`cvd-test-color green simulated ${currentFilter}`}></div>
                      <div className={`cvd-test-color blue simulated ${currentFilter}`}></div>
                      <div className={`cvd-test-color yellow simulated ${currentFilter}`}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="control-panel">
          {mode === 'customize' ? (
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
                <h2>CVD Simulation Filters</h2>
                <div className="filter-section">
                  <div className="cvd-scientific-info">
                    <h4>Scientific CVD Simulation</h4>
                    <p>Based on Brettel, Viénot & Mollon (1997) color transformation matrices used in accessibility research.</p>
                    <ul>
                      <li><strong>Protanopia/Deuteranopia:</strong> Red-Green color blindness</li>
                      <li><strong>Tritanopia:</strong> Blue-Yellow color blindness</li>
                      <li><strong>Achromatopsia:</strong> Complete color blindness</li>
                    </ul>
                  </div>
                  
                  <div className="cvd-category-section">
                    <h3>Red-Green Color Blindness (Most Common)</h3>
                    <div className="filter-grid">
                      {cvdSimulationFilters
                        .filter(f => f.type.includes('protan') || f.type.includes('deuteran'))
                        .map((filter) => (
                        <div
                          key={filter.id}
                          className={`filter-card ${currentFilter === filter.id ? 'active' : ''}`}
                          onClick={() => handleFilterChange(filter.id)}
                        >
                          <div className={`filter-preview filter-${filter.type}-preview`}>
                            <div className="filter-preview-content">
                              <div className="cvd-test-grid">
                                <div className="cvd-test-cell red"></div>
                                <div className="cvd-test-cell green"></div>
                                <div className="cvd-test-cell blue"></div>
                                <div className="cvd-test-cell yellow"></div>
                              </div>
                            </div>
                          </div>
                          <div className="filter-info">
                            <h4>{filter.name}</h4>
                            <p>{filter.description}</p>
                            <div className="filter-meta">
                              <span className="filter-prevalence">{filter.prevalence}</span>
                              <span className="filter-severity">{filter.severity}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="cvd-category-section">
                    <h3>Blue-Yellow Color Blindness (Rare)</h3>
                    <div className="filter-grid">
                      {cvdSimulationFilters
                        .filter(f => f.type.includes('tritan'))
                        .map((filter) => (
                        <div
                          key={filter.id}
                          className={`filter-card ${currentFilter === filter.id ? 'active' : ''}`}
                          onClick={() => handleFilterChange(filter.id)}
                        >
                          <div className={`filter-preview filter-${filter.type}-preview`}>
                            <div className="filter-preview-content">
                              <div className="cvd-test-grid">
                                <div className="cvd-test-cell red"></div>
                                <div className="cvd-test-cell green"></div>
                                <div className="cvd-test-cell blue"></div>
                                <div className="cvd-test-cell yellow"></div>
                              </div>
                            </div>
                          </div>
                          <div className="filter-info">
                            <h4>{filter.name}</h4>
                            <p>{filter.description}</p>
                            <div className="filter-meta">
                              <span className="filter-prevalence">{filter.prevalence}</span>
                              <span className="filter-severity">{filter.severity}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="cvd-category-section">
                    <h3>Complete & Partial Color Blindness (Very Rare)</h3>
                    <div className="filter-grid">
                      {cvdSimulationFilters
                        .filter(f => f.type.includes('achromat'))
                        .map((filter) => (
                        <div
                          key={filter.id}
                          className={`filter-card ${currentFilter === filter.id ? 'active' : ''}`}
                          onClick={() => handleFilterChange(filter.id)}
                        >
                          <div className={`filter-preview filter-${filter.type}-preview`}>
                            <div className="filter-preview-content">
                              <div className="cvd-test-grid">
                                <div className="cvd-test-cell red"></div>
                                <div className="cvd-test-cell green"></div>
                                <div className="cvd-test-cell blue"></div>
                                <div className="cvd-test-cell yellow"></div>
                              </div>
                            </div>
                          </div>
                          <div className="filter-info">
                            <h4>{filter.name}</h4>
                            <p>{filter.description}</p>
                            <div className="filter-meta">
                              <span className="filter-prevalence">{filter.prevalence}</span>
                              <span className="filter-severity">{filter.severity}</span>
                            </div>
                          </div>
                        </div>
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
                    onClick={resetToDefault}
                  >
                    🔲 Reset Filter
                  </button>
                  
                  <button 
                    className="action-button screenshot-action"
                    onClick={() => {
                      const canvas = document.querySelector('canvas');
                      if (canvas) {
                        const link = document.createElement('a');
                        link.download = `furniture-${currentModel}-cvd-${currentFilter}-${Date.now()}.png`;
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
                          const newSectionColors = { ...sectionColors };
                          delete newSectionColors[selectedSection];
                          setSectionColors(newSectionColors);
                          
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
                  
                  {selectedFurniture && (
                    <>
                      <div className="transform-buttons">
                        <button 
                          className={`transform-button ${transformMode === 'translate' ? 'active' : ''}`}
                          onClick={() => {
                            if (selectedFurniture && transformControlsRef.current) {
                              transformControlsRef.current.setMode('translate');
                              setTransformMode('translate');
                            }
                          }}
                        >
                          ↔️ Move (W)
                        </button>
                        <button 
                          className={`transform-button ${transformMode === 'rotate' ? 'active' : ''}`}
                          onClick={() => {
                            if (selectedFurniture && transformControlsRef.current) {
                              transformControlsRef.current.setMode('rotate');
                              setTransformMode('rotate');
                            }
                          }}
                          title="Horizontal rotation only (Y-axis)"
                        >
                          🔄 Rotate (E)
                        </button>
                        <button 
                          className={`transform-button ${transformMode === 'scale' ? 'active' : ''}`}
                          onClick={() => {
                            if (selectedFurniture && transformControlsRef.current) {
                              transformControlsRef.current.setMode('scale');
                              setTransformMode('scale');
                            }
                          }}
                        >
                          ⚖️ Scale (R)
                        </button>
                      </div>
                      
                      <div className="deselect-section">
                        <button 
                          className="deselect-button"
                          onClick={handleDeselect}
                        >
                          ✕ Deselect (ESC)
                        </button>
                        <button 
                          className="delete-button"
                          onClick={removeSelectedFurniture}
                        >
                          🗑️ Delete (DEL)
                        </button>
                      </div>
                      
                      <p className="transform-tip">
                        Tip: Drag the colored handles to transform. Use W, E, R keys to switch modes.
                      </p>
                      <p className="rotation-tip">
                        <small>Rotation is locked to horizontal (Y-axis) only</small>
                      </p>
                    </>
                  )}
                </div>
              </div>

              <div className="control-section">
                <h2>Room Settings</h2>
                <div className="room-settings">
                  <div className="setting-group">
                    <label>CVD Simulation Filter:</label>
                    <select 
                      value={currentFilter}
                      onChange={(e) => handleFilterChange(e.target.value)}
                      className="filter-select"
                    >
                      {cvdSimulationFilters.map(filter => (
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
                          link.download = `room-layout-cvd-${currentFilter}-${Date.now()}.png`;
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

              <div className="control-section">
                <h2>Furniture Size Controls</h2>
                <div className="size-controls">
                  <p className="size-instruction">
                    Adjust the size of each furniture type. Changes apply to all items of that type.
                  </p>
                  
                  <div className="size-sliders">
                    {modelList.map((model) => (
                      <div key={model.id} className="size-slider-group">
                        <div className="slider-header">
                          <span className="slider-label">{model.name} Size</span>
                          <span className="slider-value">{(furnitureSizeScale[model.id] * 100).toFixed(0)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0.5"
                          max="2.0"
                          step="0.1"
                          value={furnitureSizeScale[model.id]}
                          onChange={(e) => updateFurnitureSizeScale(model.id, parseFloat(e.target.value))}
                          className="size-slider"
                        />
                        <div className="slider-ticks">
                          <span>Small</span>
                          <span>Medium</span>
                          <span>Large</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="size-presets">
                    <h4>Quick Presets:</h4>
                    <div className="preset-buttons">
                      <button 
                        className="preset-button"
                        onClick={() => {
                          const presets = {};
                          modelList.forEach(model => {
                            presets[model.id] = 1.0;
                          });
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
                          const presets = {};
                          modelList.forEach(model => {
                            presets[model.id] = 0.6;
                          });
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
                          const presets = {};
                          modelList.forEach(model => {
                            presets[model.id] = 1.2;
                          });
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