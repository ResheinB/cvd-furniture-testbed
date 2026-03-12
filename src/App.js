import React, { useState, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, TransformControls, Environment } from '@react-three/drei';
import * as THREE from 'three';
import FurnitureModel from './components/threejs/FurnitureModel';
import RoomLayout from './components/threejs/RoomLayout';
import CVDPostProcessing from './components/threejs/CVDPostProcessing';
import './App.css';

/* =========================================
   UI COMPONENTS (Artsy Theme)
   ========================================= */

const Tooltip = ({ children, text }) => (
  <div className="tooltip-wrapper" aria-label={text}>
    {children}
    <div className="tooltip-content" role="tooltip">{text}</div>
  </div>
);

const ToastContainer = ({ toasts }) => (
  <div className="toast-container" aria-live="polite">
    {toasts.map(t => (
      <div key={t.id} className={`toast ${t.type}`}>
        {t.message}
      </div>
    ))}
  </div>
);

/* =========================================
   MAIN APP COMPONENT
   ========================================= */

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
  const [userType, setUserType] = useState('normal'); 
  const [modelCustomizations, setModelCustomizations] = useState({
    'desk': {}, 'chair': {}, 'wardrobe': {}, 'bookshelf': {}, 'bed': {}, 'sofa': {}, 'table': {}, 'cabinet': {},
  });
  const [furnitureSizeScale, setFurnitureSizeScale] = useState({
    'desk': 1.0, 'chair': 1.0, 'wardrobe': 1.0, 'bookshelf': 1.0, 'bed': 1.0, 'sofa': 1.0, 'table': 1.0, 'cabinet': 1.0,
  });
  const [furnitureItems, setFurnitureItems] = useState([]);
  
  const orbitControlsRef = useRef();
  const transformControlsRef = useRef();
  const modelRef = useRef();
  const [isTransforming, setIsTransforming] = useState(false);

  // ========== UI EXTENSIONS ==========
  const [highContrast, setHighContrast] = useState(false);
  const [toasts, setToasts] = useState([]);
  const fireToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
  };

  // ========== CONSTANTS ==========
  const sectionColorPalette = [
    '#2c2a29', '#f7f5f0', '#d96c53', '#849681', '#dfb36b', '#c1a68d', 
    '#A6764D', '#F5F5F5', '#8A2BE2', '#FF6B6B', '#4ECDC4', '#45B7D1',
    '#D4A76A', '#3C2F2F', '#E1C699', '#FFFFFF', '#808080', '#2196F3', '#4CAF50', '#F44336'
  ];

  const cvdColorPalette = [
    { color: '#000000', name: 'Black', hex: '#000000', description: 'Deep black' },
    { color: '#FFFFFF', name: 'White', hex: '#FFFFFF', description: 'Pure white' },
    { color: '#FF0000', name: 'Red', hex: '#FF0000', description: 'Bright red' },
    { color: '#0000FF', name: 'Blue', hex: '#0000FF', description: 'Deep blue' },
    { color: '#FFFF00', name: 'Yellow', hex: '#FFFF00', description: 'Bright yellow' },
    { color: '#008000', name: 'Green', hex: '#008000', description: 'Forest green' },
    { color: '#FFA500', name: 'Orange', hex: '#FFA500', description: 'Warm orange' },
    { color: '#800080', name: 'Purple', hex: '#800080', description: 'Royal purple' },
    { color: '#A52A2A', name: 'Brown', hex: '#A52A2A', description: 'Warm brown' },
    { color: '#808080', name: 'Gray', hex: '#808080', description: 'Medium gray' },
    { color: '#FFC0CB', name: 'Pink', hex: '#FFC0CB', description: 'Soft pink' },
    { color: '#00FFFF', name: 'Cyan', hex: '#00FFFF', description: 'Bright cyan' },
    { color: '#FF00FF', name: 'Magenta', hex: '#FF00FF', description: 'Vibrant magenta' },
    { color: '#C0C0C0', name: 'Silver', hex: '#C0C0C0', description: 'Metallic silver' },
    { color: '#FFD700', name: 'Gold', hex: '#FFD700', description: 'Rich gold' },
    { color: '#4B0082', name: 'Indigo', hex: '#4B0082', description: 'Deep indigo' },
  ];

  const cvdSimulationFilters = [
    { id: 'none', name: 'No Filter', description: 'Normal color vision', type: 'none', matrix: [1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1], prevalence: 'Normal vision', severity: 'N/A' },
    { id: 'protanopia', name: 'Protanopia', description: 'Cannot perceive red light (red cones missing)', type: 'protanopia', matrix: [0.567,0.433,0,0,0.558,0.442,0,0,0,0.242,0.758,0,0,0,0,1], prevalence: '1% of males', severity: 'Severe' },
    { id: 'protanomaly', name: 'Protanomaly', description: 'Reduced sensitivity to red light (red cones abnormal)', type: 'protanomaly', matrix: [0.817,0.183,0,0,0.333,0.667,0,0,0,0.125,0.875,0,0,0,0,1], prevalence: '1% of males', severity: 'Mild' },
    { id: 'deuteranopia', name: 'Deuteranopia', description: 'Cannot perceive green light (green cones missing)', type: 'deuteranopia', matrix: [0.625,0.375,0,0,0.7,0.3,0,0,0,0.3,0.7,0,0,0,0,1], prevalence: '1% of males', severity: 'Severe' },
    { id: 'deuteranomaly', name: 'Deuteranomaly', description: 'Reduced sensitivity to green light (green cones abnormal)', type: 'deuteranomaly', matrix: [0.8,0.2,0,0,0.258,0.742,0,0,0,0.142,0.858,0,0,0,0,1], prevalence: '5% of males', severity: 'Mild' },
    { id: 'tritanopia', name: 'Tritanopia', description: 'Cannot perceive blue light (blue cones missing)', type: 'tritanopia', matrix: [0.95,0.05,0,0,0,0.433,0.567,0,0,0.475,0.525,0,0,0,0,1], prevalence: '0.01% of population', severity: 'Severe' },
    { id: 'tritanomaly', name: 'Tritanomaly', description: 'Reduced sensitivity to blue light (blue cones abnormal)', type: 'tritanomaly', matrix: [0.967,0.033,0,0,0,0.733,0.267,0,0,0.183,0.817,0,0,0,0,1], prevalence: '0.01% of population', severity: 'Mild' },
    { id: 'achromatopsia', name: 'Achromatopsia', description: 'Complete color blindness (all cones missing)', type: 'achromatopsia', matrix: [0.299,0.587,0.114,0,0.299,0.587,0.114,0,0.299,0.587,0.114,0,0,0,0,1], prevalence: '0.003% of population', severity: 'Complete' },
    { id: 'achromatomaly', name: 'Achromatomaly', description: 'Partial color blindness (reduced color vision)', type: 'achromatomaly', matrix: [0.618,0.320,0.062,0,0.163,0.775,0.062,0,0.163,0.320,0.516,0,0,0,0,1], prevalence: '0.001% of population', severity: 'Partial' }
  ];

  const textureList = [
    { id: 'none', name: 'Matte', description: 'Solid color only', icon: '🟦' },
    { id: 'wood', name: 'Timber', description: 'Natural wood texture', icon: '🪵' },
    { id: 'marble', name: 'Stone', description: 'Elegant marble texture', icon: '🗿' },
    { id: 'fabric', name: 'Textile', description: 'Soft fabric texture', icon: '🧵' },
    { id: 'metal', name: 'Steel', description: 'Brushed metal texture', icon: '🔩' },
    { id: 'leather', name: 'Leather', description: 'Genuine leather texture', icon: '🐄' },
    { id: 'concrete', name: 'Concrete', description: 'Industrial concrete texture', icon: '🏗️' },
    { id: 'glass', name: 'Glass', description: 'Transparent glass effect', icon: '🔮' }
  ];
  
  const modelList = [
    { id: 'desk', name: 'Studio Desk', icon: '🪑', normalizedScale: 0.8 },
    { id: 'chair', name: 'Lounge Chair', icon: '💺', normalizedScale: 0.8 },
    { id: 'wardrobe', name: 'Wardrobe', icon: '🚪', normalizedScale: 0.7 },
    { id: 'bookshelf', name: 'Bookshelf', icon: '📚', normalizedScale: 0.9 },
    { id: 'bed', name: 'Platform Bed', icon: '🛏️', normalizedScale: 0.5 },
    { id: 'sofa', name: 'Sofa', icon: '🛋️', normalizedScale: 0.6 },
    { id: 'table', name: 'Dining Table', icon: '🍽️', normalizedScale: 0.8 },
    { id: 'cabinet', name: 'Cabinet', icon: '🥘', normalizedScale: 0.8 },
  ];

  // ========== EFFECTS & EVENT HANDLERS ==========
  useEffect(() => {
    setIsLoading(false);
    return () => { if (transformControlsRef.current) transformControlsRef.current.detach(); };
  }, []);

  useEffect(() => {
    if (highContrast) document.body.setAttribute('data-theme', 'high-contrast');
    else document.body.removeAttribute('data-theme');
  }, [highContrast]);

  const getColorHex = (colorData) => {
    if (!colorData) return '#FFFFFF';
    if (typeof colorData === 'string') return colorData;
    if (typeof colorData === 'object' && colorData.hex) return colorData.hex;
    if (typeof colorData === 'object' && colorData.color) return colorData.color;
    return '#FFFFFF';
  };

  const getColorName = (colorData) => {
    if (!colorData) return 'Default';
    if (typeof colorData === 'string') {
      const cvdColor = cvdColorPalette.find(c => c.color === colorData);
      return cvdColor ? cvdColor.name : 'Custom Color';
    }
    if (typeof colorData === 'object' && colorData.name) return colorData.name;
    return 'Custom Color';
  };

  const getHexColorsForModel = (colors) => {
    const hexColors = {};
    Object.entries(colors).forEach(([section, colorData]) => { hexColors[section] = getColorHex(colorData); });
    return hexColors;
  };

  const getHexCustomizationsForModel = (modelType) => {
    const savedColors = modelCustomizations[modelType] || {};
    return getHexColorsForModel(savedColors);
  };

  const announceToScreenReader = (message) => {
    const announcer = document.getElementById('sr-announcer');
    if (announcer) {
      announcer.textContent = message;
      setTimeout(() => { announcer.textContent = ''; }, 1000);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (e.key === 'Escape' && selectedFurniture) { e.preventDefault(); handleDeselect(); return; }
      if (mode === 'layout' && selectedFurniture && transformControlsRef.current) {
        switch(e.key.toLowerCase()) {
          case 'w': e.preventDefault(); transformControlsRef.current.setMode('translate'); setTransformMode('translate'); fireToast('Translate Tool', 'info'); break;
          case 'e': e.preventDefault(); transformControlsRef.current.setMode('rotate'); setTransformMode('rotate'); fireToast('Rotate Tool', 'info'); break;
          case 'r': e.preventDefault(); transformControlsRef.current.setMode('scale'); setTransformMode('scale'); fireToast('Scale Tool', 'info'); break;
          case 'delete': case 'backspace': e.preventDefault(); removeSelectedFurniture(); handleDeselect(); break;
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mode, selectedFurniture]);

  useEffect(() => {
    if (mode === 'layout') {
      if (isTransforming) document.body.style.cursor = transformMode === 'translate' ? 'move' : transformMode === 'rotate' ? 'grab' : 'nwse-resize';
      else document.body.style.cursor = 'grab';
    } else {
      document.body.style.cursor = 'default';
    }
  }, [mode, isTransforming, transformMode]);

  const handleUserTypeChange = (type) => {
    setUserType(type);
    if (type === 'cvd') setCurrentFilter('none');
    fireToast(`${type === 'cvd' ? 'Inclusive' : 'Standard'} View Activated`, 'success');
    announceToScreenReader(`Switched to ${type === 'cvd' ? 'color blind' : 'normal'} mode`);
  };

  const handleSectionSelect = (sectionName) => {
    if (mode === 'customize') {
      setSelectedSection(sectionName);
      if (userType === 'cvd') announceToScreenReader(`Selected ${sectionName}`);
    }
  };

  const applyColorToSection = (color, colorName) => {
    if (!selectedSection || mode !== 'customize') {
      fireToast('Select a structural part on the canvas first', 'error');
      return;
    }
    const colorData = { hex: typeof color === 'string' ? color : color.color, name: colorName || getColorName(color) };
    const newSectionColors = { ...sectionColors, [selectedSection]: colorData };
    setSectionColors(newSectionColors);
    setModelCustomizations(prev => ({ ...prev, [currentModel]: newSectionColors }));
    if (modelRef.current && modelRef.current.applyColorToSection) modelRef.current.applyColorToSection(selectedSection, colorData.hex);
    if (userType === 'cvd') announceToScreenReader(`Applied ${colorData.name} to ${selectedSection}`);
  };

  const resetAllCustomizations = () => {
    if (mode === 'customize' && modelRef.current && modelRef.current.resetAllColors) {
      const resetCount = modelRef.current.resetAllColors();
      setSectionColors({});
      setModelCustomizations(prev => ({ ...prev, [currentModel]: {} }));
      fireToast(`Canvas cleared`, 'success');
      if (userType === 'cvd') announceToScreenReader(`Reset ${resetCount} customizations`);
    }
  };

  const resetToDefault = () => {
    setCurrentFilter('none');
    if (mode === 'customize' && modelRef.current && modelRef.current.resetAllColors) {
      modelRef.current.resetAllColors();
      setSectionColors({});
      setModelCustomizations(prev => ({ ...prev, [currentModel]: {} }));
      fireToast('Filters and customizations reset', 'success');
    }
  };

  const handleModelChange = (modelId) => {
    setCurrentModel(modelId);
    setSelectedSection(null);
    const savedCustomizations = modelCustomizations[modelId] || {};
    setSectionColors(savedCustomizations);
    if (userType === 'cvd') announceToScreenReader(`Switched to ${modelList.find(m => m.id === modelId)?.name}`);
  };

  const handleModeChange = (newMode) => {
    setMode(newMode);
    setSelectedSection(null);
    handleDeselect();
    if (transformControlsRef.current) transformControlsRef.current.detach();
    fireToast(`${newMode === 'customize' ? 'Studio' : 'Gallery'} Space`, 'info');
  };

  const handleFurnitureSelect = (furnitureId) => {
    if (mode === 'layout') {
      if (selectedFurniture === furnitureId) { handleDeselect(); return; }
      setSelectedFurniture(furnitureId);
      setIsTransforming(true);
      if (orbitControlsRef.current) orbitControlsRef.current.enabled = false;
      if (userType === 'cvd') {
        const item = furnitureItems.find(f => f.id === furnitureId);
        announceToScreenReader(`Selected ${item?.type}`);
      }
    }
  };

  const handleDeselect = () => {
    setSelectedFurniture(null);
    setIsTransforming(false);
    if (orbitControlsRef.current) orbitControlsRef.current.enabled = true;
    if (transformControlsRef.current) transformControlsRef.current.detach();
  };

  const handleCanvasClick = (event) => {
    if (mode === 'layout' && selectedFurniture) {
      if (!event.object || event.object.name === 'room' || event.object.name === 'floor' || event.object.name === 'grid') {
        handleDeselect();
      }
    }
  };

  const handleTransformStart = () => {
    if (orbitControlsRef.current) orbitControlsRef.current.enabled = false;
    setIsTransforming(true);
  };

  const handleTransformChange = (e) => {
    if (!e?.target?.object || !selectedFurniture) return;
    const selectedItem = furnitureItems.find(f => f.id === selectedFurniture);
    if (!selectedItem) return;
    const newPosition = [e.target.object.position.x, e.target.object.position.y, e.target.object.position.z];
    let newRotation = transformMode === 'rotate' ? [0, e.target.object.rotation.y, 0] : [e.target.object.rotation.x, e.target.object.rotation.y, e.target.object.rotation.z];
    let newScale = transformMode === 'scale' ? e.target.object.scale.x : selectedItem.scale;
    updateFurniturePosition(selectedFurniture, newPosition, newRotation, newScale);
  };

  const updateFurniturePosition = (id, position, rotation, scale) => {
    setFurnitureItems(prev => prev.map(item => item.id === id ? { ...item, position, rotation, scale } : item));
  };

  const adjustSelectedFurnitureScale = (amount) => {
    if (!selectedFurniture) return;
    setFurnitureItems(prev => prev.map(item => {
      if (item.id === selectedFurniture) {
        // Prevent scaling down to zero or negative numbers
        const newScale = Math.max(0.1, item.scale + amount);
        return { ...item, scale: newScale };
      }
      return item;
    }));
  };

  const addFurnitureItem = (type) => {
    const newId = `${type}-${Date.now()}`;
    const newItem = { id: newId, type, position: [0, 0, 0], rotation: [0, 0, 0], scale: furnitureSizeScale[type] || 1, normalizedScale: getNormalizedScale(type), visible: true };
    setFurnitureItems(prev => [...prev, newItem]);
    handleFurnitureSelect(newId);
    fireToast(`Placed ${type}`, 'success');
    if (userType === 'cvd') announceToScreenReader(`Added ${type} to room`);
  };

  const removeSelectedFurniture = () => {
    if (selectedFurniture) {
      const item = furnitureItems.find(f => f.id === selectedFurniture);
      setFurnitureItems(prev => prev.filter(item => item.id !== selectedFurniture));
      handleDeselect();
      fireToast('Removed from scene', 'success');
      if (userType === 'cvd') announceToScreenReader(`Removed ${item?.type}`);
    }
  };

  const toggleFurnitureVisibility = (id) => {
    setFurnitureItems(prev => prev.map(item => item.id === id ? { ...item, visible: !item.visible } : item));
  };

  const getNormalizedScale = (type) => { return modelList.find(m => m.id === type)?.normalizedScale || 0.8; };

  const updateFurnitureSizeScale = (furnitureType, scale) => {
    setFurnitureSizeScale(prev => ({ ...prev, [furnitureType]: scale }));
    setFurnitureItems(prev => prev.map(item => item.type === furnitureType ? { ...item, scale } : item));
  };

  const resetLayout = () => { setFurnitureItems([]); handleDeselect(); fireToast('Gallery cleared', 'info'); };
  const getCurrentNormalizedScale = () => { return modelList.find(m => m.id === currentModel)?.normalizedScale || 0.8; };
  const handleFilterChange = (filterId) => { if (userType === 'normal') setCurrentFilter(filterId); };

  // ========== RENDER UI ==========
  if (isLoading) return <div className="app-container" style={{justifyContent:'center', alignItems:'center'}}>Setting the scene...</div>;

  return (
    <div className="app-container">
      <div id="sr-announcer" className="sr-only" aria-live="polite"></div>
      <ToastContainer toasts={toasts} />

      {/* HEADER: Artsy Branding */}
      <header className="app-header">
        <div className="header-brand">
          <h1>DesignEyes</h1>
        </div>
        
        <div className="header-controls">
          {/* Workspace Mode */}
          <div style={{ display: 'flex', background: 'var(--bg-color)', borderRadius: '50px', padding: '4px', border: 'var(--border-fine)' }}>
             <button className={`btn ${mode === 'customize' ? 'btn-primary' : ''}`} style={{border: 'none'}} onClick={() => handleModeChange('customize')} aria-pressed={mode === 'customize'}>✨ Studio</button>
             <button className={`btn ${mode === 'layout' ? 'btn-primary' : ''}`} style={{border: 'none'}} onClick={() => handleModeChange('layout')} aria-pressed={mode === 'layout'}>🏛️ Gallery</button>
          </div>

          <div style={{width: '1px', height: '24px', background: 'var(--border-fine)', margin: '0 0.5rem'}}></div>

          {/* User Type */}
          <Tooltip text={userType === 'normal' ? "Switch to Accessible CVD Tools" : "Switch to Standard Designer Tools"}>
             <button className={`btn ${userType === 'cvd' ? 'btn-primary' : ''}`} onClick={() => handleUserTypeChange(userType === 'normal' ? 'cvd' : 'normal')} aria-pressed={userType === 'cvd'}>
               {userType === 'normal' ? '👁️ Standard' : '👓 Inclusive'}
             </button>
          </Tooltip>

          {/* High Contrast */}
          <Tooltip text="High Contrast Overlay">
             <button className={`btn ${highContrast ? 'btn-primary' : ''}`} onClick={() => setHighContrast(!highContrast)} aria-pressed={highContrast}>🌓</button>
          </Tooltip>
        </div>
      </header>

      <main className="workspace">
        {/* LEFT: Framed 3D Canvas */}
        <section className="canvas-container">
          <div className="canvas-overlay-badges">
            <span className="badge">{mode === 'layout' ? 'Gallery View' : 'Studio View'}</span>
            
            {mode === 'customize' && <span className="badge" style={{background: 'var(--primary)', color: '#fff', border: 'none'}}>{modelList.find(m => m.id === currentModel)?.name}</span>}
            {mode === 'customize' && userType === 'normal' && currentFilter !== 'none' && <span className="badge" style={{background: '#d9534f', color: '#fff', border: 'none'}}>Lens: {cvdSimulationFilters.find(f => f.id === currentFilter)?.name}</span>}
            
            {/* FIX: Badge text color updated for visibility */}
            {mode === 'layout' && selectedFurniture && <span className="badge" style={{background: 'var(--text-main)', color: 'var(--surface)', border: 'none'}}>Framing: {furnitureItems.find(f => f.id === selectedFurniture)?.type}</span>}
          </div>

          <Canvas 
            camera={mode === 'layout' ? { position: [7, 5, 7], fov: 50, up: [0, 1, 0] } : { position: [5, 5, 5], fov: 50 }}
            onClick={handleCanvasClick}
            onPointerMissed={handleDeselect}
            style={{ cursor: mode === 'layout' ? (isTransforming ? (transformMode === 'translate' ? 'move' : transformMode === 'rotate' ? 'grab' : 'nwse-resize') : 'grab') : 'default' }}
            onCreated={({ gl }) => { gl.domElement.style.touchAction = 'none'; }}
          >
            <ambientLight intensity={1.5} color="#ffffff" />
            <directionalLight position={mode === 'layout' ? [15, 20, 15] : [10, 15, 10]} intensity={1.2} castShadow />
            <directionalLight position={[-10, 10, -5]} intensity={0.6} color="#ffeb3b" />
            <pointLight position={[0, 10, 0]} intensity={0.8} color="#ffffff" distance={30} decay={2} />
            <hemisphereLight skyColor="#ffffff" groundColor="#808080" intensity={0.8} />

            {mode === 'customize' ? (
              <FurnitureModel 
                currentModel={currentModel} 
                currentFilter={userType === 'normal' ? currentFilter : 'none'} 
                currentTexture={currentTexture} 
                selectedSection={selectedSection} 
                sectionColors={getHexColorsForModel(sectionColors)} 
                onSectionSelect={handleSectionSelect} 
                normalizedScale={getCurrentNormalizedScale()} 
                ref={modelRef} 
                mode="customize" 
              />
            ) : (
              <group>
                <RoomLayout />
                {furnitureItems.filter(item => item.visible).map((item) => {
                  const savedCustomizations = getHexCustomizationsForModel(item.type);
                  return (
                    <group key={item.id} position={item.position} rotation={item.rotation} scale={[item.scale, item.scale, item.scale]}>
                      <FurnitureModel 
                        currentModel={item.type} 
                        currentFilter={userType === 'normal' ? currentFilter : 'none'} 
                        sectionColors={savedCustomizations} 
                        normalizedScale={item.normalizedScale} 
                        isSelected={selectedFurniture === item.id} 
                        onClick={(e) => { if (e && e.stopPropagation) e.stopPropagation(); handleFurnitureSelect(item.id); }} 
                        mode="layout" 
                      />
                    </group>
                  );
                })}

                {selectedFurniture && (
                  <TransformControls 
                    ref={transformControlsRef} 
                    mode={transformMode} 
                    onMouseDown={handleTransformStart} 
                    onMouseUp={() => {}} 
                    onChange={handleTransformChange} 
                  />
                )}
              </group>
            )}

            <OrbitControls ref={orbitControlsRef} makeDefault />
            
            {userType === 'normal' && currentFilter !== 'none' && (
              <CVDPostProcessing filterType={currentFilter} filterMatrix={cvdSimulationFilters.find(f => f.id === currentFilter)?.matrix} />
            )}
          </Canvas>
        </section>

        {/* RIGHT: Artsy Arched Sidebar */}
        <aside className="sidebar">
          {mode === 'customize' ? (
            <>
              {/* 1. Model Selection */}
              <div className="control-group animate-fade-in">
                <h3>Collection</h3>
                <div className="grid-2col">
                  {modelList.map(m => (
                    <button key={m.id} className={`selectable-card ${currentModel === m.id ? 'active' : ''}`} onClick={() => handleModelChange(m.id)}>
                      <span style={{fontSize: '1.8rem'}}>{m.icon}</span>
                      <strong>{m.name}</strong>
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Coloring */}
              <div className="control-group animate-fade-in" style={{animationDelay: '0.1s'}}>
                <h3>Pigments</h3>
                {!selectedSection && <p style={{fontSize:'0.85rem', color:'#d9534f', fontStyle: 'italic'}}>Highlight a form on the canvas to paint.</p>}
                
                {selectedSection && <p style={{fontSize:'0.9rem'}}>Subject: <strong>{selectedSection}</strong></p>}
                
                <div className="grid-4col">
                  {userType === 'cvd' ? 
                     cvdColorPalette.map(c => (
                       <Tooltip key={c.hex} text={c.name}>
                         <button className="color-swatch" style={{ backgroundColor: c.hex }} onClick={() => applyColorToSection(c, c.name)} />
                       </Tooltip>
                     )) : 
                     sectionColorPalette.map(hex => (
                       <button key={hex} className="color-swatch" style={{ backgroundColor: hex }} onClick={() => applyColorToSection(hex, null)} />
                     ))
                  }
                </div>

                <h3 style={{marginTop: '1.5rem'}}>Finishes</h3>
                <div className="grid-2col">
                  {textureList.map(t => (
                    <button key={t.id} className={`btn ${currentTexture === t.id ? 'btn-primary' : ''}`} style={{justifyContent:'center'}} onClick={() => setCurrentTexture(t.id)}>
                      {t.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. CVD Filters */}
              {userType === 'normal' && (
                <div className="control-group animate-fade-in" style={{animationDelay: '0.2s'}}>
                  <h3>Vision Lenses</h3>
                  <select className="btn" style={{width: '100%', textAlign: 'left', padding: '0.8rem', fontFamily: 'Lora'}} value={currentFilter} onChange={(e) => handleFilterChange(e.target.value)}>
                    {cvdSimulationFilters.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                  </select>
                </div>
              )}

              {/* Quick Actions */}
              <div className="control-group animate-fade-in" style={{animationDelay: '0.3s'}}>
                <div className="grid-2col" style={{marginTop: '1rem'}}>
                  <button className="btn btn-danger" style={{justifyContent: 'center'}} onClick={resetAllCustomizations}>Scrub Canvas</button>
                  <button className="btn" style={{justifyContent: 'center'}} onClick={resetToDefault}>Clear Lenses</button>
                </div>
              </div>
            </>
          ) : (
             <div className="control-group animate-fade-in">
               <h3>Curate Space</h3>
               
               <p style={{fontSize: '0.9rem', marginBottom: '0.5rem', fontStyle: 'italic'}}>Bring forms into the gallery:</p>
               <div className="grid-3col">
                 {modelList.map(m => (
                   <button key={m.id} className="btn" style={{justifyContent: 'center', fontSize:'0.8rem', padding:'0.6rem'}} onClick={() => addFurnitureItem(m.id)}>
                     + {m.name}
                   </button>
                 ))}
               </div>

               {selectedFurniture && (
                 <>
                   <p style={{fontSize: '0.9rem', marginTop: '1.5rem', marginBottom: '0.5rem', fontStyle: 'italic'}}>Spatial Transform:</p>
                   <div style={{display: 'flex', gap: '0.5rem'}}>
                      <button className={`btn ${transformMode === 'translate' ? 'btn-primary' : ''}`} style={{flex: 1, padding: '0.5rem', justifyContent: 'center'}} onClick={() => { setTransformMode('translate'); if(transformControlsRef.current) transformControlsRef.current.setMode('translate');}}>Slide</button>
                      <button className={`btn ${transformMode === 'rotate' ? 'btn-primary' : ''}`} style={{flex: 1, padding: '0.5rem', justifyContent: 'center'}} onClick={() => { setTransformMode('rotate'); if(transformControlsRef.current) transformControlsRef.current.setMode('rotate');}}>Turn</button>
                      <button className={`btn ${transformMode === 'scale' ? 'btn-primary' : ''}`} style={{flex: 1, padding: '0.5rem', justifyContent: 'center'}} onClick={() => { setTransformMode('scale'); if(transformControlsRef.current) transformControlsRef.current.setMode('scale');}}>Resize</button>
                   </div>
                   
                   <p style={{fontSize: '0.9rem', marginTop: '1rem', marginBottom: '0.5rem', fontStyle: 'italic'}}>Fine-tune Size:</p>
                   <div style={{display: 'flex', gap: '0.5rem', alignItems: 'center'}}>
                     <button className="btn" style={{flex: 1, justifyContent: 'center'}} onClick={() => adjustSelectedFurnitureScale(-0.1)} aria-label="Decrease size">
                       - Shrink
                     </button>
                     <span style={{fontSize: '0.95rem', fontWeight: 'bold', width: '60px', textAlign: 'center'}}>
                       {Math.round((furnitureItems.find(f => f.id === selectedFurniture)?.scale || 1) * 100)}%
                     </span>
                     <button className="btn" style={{flex: 1, justifyContent: 'center'}} onClick={() => adjustSelectedFurnitureScale(0.1)} aria-label="Increase size">
                       + Grow
                     </button>
                   </div>
                 </>
               )}

               {furnitureItems.length > 0 && (
                 <>
                   <p style={{fontSize: '0.9rem', marginTop: '1.5rem', marginBottom: '0.5rem', fontStyle: 'italic'}}>Current Exhibition:</p>
                   <div style={{maxHeight: '200px', overflowY: 'auto', paddingRight: '0.5rem'}}>
                     {furnitureItems.map(item => (
                       <div key={item.id} className={`list-item ${selectedFurniture === item.id ? 'selected' : ''}`} onClick={() => handleFurnitureSelect(item.id)}>
                         <span style={{textTransform: 'capitalize', fontSize: '0.9rem', fontWeight: 600}}>{item.type}</span>
                         <div style={{display: 'flex', gap: '0.5rem'}}>
                           <button className="btn" style={{padding: '0.2rem 0.6rem', fontSize: '0.8rem'}} onClick={(e) => { e.stopPropagation(); toggleFurnitureVisibility(item.id); }}>{item.visible ? '👁️' : '🚫'}</button>
                           <button className="btn btn-danger" style={{padding: '0.2rem 0.6rem', fontSize: '0.8rem'}} onClick={(e) => { e.stopPropagation(); setSelectedFurniture(item.id); removeSelectedFurniture(); }}>X</button>
                         </div>
                       </div>
                     ))}
                   </div>
                 </>
               )}

               <p style={{fontSize: '0.9rem', marginTop: '1.5rem', marginBottom: '0.5rem', fontStyle: 'italic'}}>Gallery Architecture:</p>
               <div className="grid-2col">
                  <button className="btn" style={{justifyContent: 'center'}} onClick={() => modelList.forEach(m => updateFurnitureSizeScale(m.id, 0.6))}>Intimate Room</button>
                  <button className="btn" style={{justifyContent: 'center'}} onClick={() => modelList.forEach(m => updateFurnitureSizeScale(m.id, 1.2))}>Grand Hall</button>
               </div>
               <button className="btn btn-danger" style={{marginTop: '1rem', justifyContent: 'center', width: '100%'}} onClick={resetLayout}>Dismantle Exhibition</button>
             </div>
          )}
        </aside>
      </main>
    </div>
  );
}

export default App;