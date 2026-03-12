import React, { useState, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, TransformControls } from '@react-three/drei';
import * as THREE from 'three';
import FurnitureModel from './components/threejs/FurnitureModel';
import RoomLayout from './components/threejs/RoomLayout';
import CVDPostProcessing from './components/threejs/CVDPostProcessing';
import './App.css';

/* =========================================
   UI COMPONENTS
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
  
  const [wallColor, setWallColor] = useState('#e8e8e8');
  const [floorTexture, setFloorTexture] = useState('none');
  
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
    '#0f172a', '#f8fafc', '#64748b', '#ef4444', '#f59e0b', '#10b981', 
    '#3b82f6', '#8b5cf6', '#ec4899', '#A6764D', '#D4A76A', '#3C2F2F'
  ];

  const cvdColorPalette = [
    { color: '#000000', name: 'Black', hex: '#000000' },
    { color: '#FFFFFF', name: 'White', hex: '#FFFFFF' },
    { color: '#FF0000', name: 'Red', hex: '#FF0000' },
    { color: '#0000FF', name: 'Blue', hex: '#0000FF' },
    { color: '#FFFF00', name: 'Yellow', hex: '#FFFF00' },
    { color: '#008000', name: 'Green', hex: '#008000' },
    { color: '#FFA500', name: 'Orange', hex: '#FFA500' },
    { color: '#800080', name: 'Purple', hex: '#800080' },
    { color: '#A52A2A', name: 'Brown', hex: '#A52A2A' },
    { color: '#808080', name: 'Gray', hex: '#808080' },
    { color: '#FFC0CB', name: 'Pink', hex: '#FFC0CB' },
    { color: '#00FFFF', name: 'Cyan', hex: '#00FFFF' },
  ];

  const cvdSimulationFilters = [
    { id: 'none', name: 'Standard Vision', matrix: [1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1] },
    { id: 'protanopia', name: 'Protanopia (No Red)', matrix: [0.567,0.433,0,0,0.558,0.442,0,0,0,0.242,0.758,0,0,0,0,1] },
    { id: 'deuteranopia', name: 'Deuteranopia (No Green)', matrix: [0.625,0.375,0,0,0.7,0.3,0,0,0,0.3,0.7,0,0,0,0,1] },
    { id: 'tritanopia', name: 'Tritanopia (No Blue)', matrix: [0.95,0.05,0,0,0,0.433,0.567,0,0,0.475,0.525,0,0,0,0,1] },
    { id: 'achromatopsia', name: 'Achromatopsia (Monochrome)', matrix: [0.299,0.587,0.114,0,0.299,0.587,0.114,0,0.299,0.587,0.114,0,0,0,0,1] }
  ];

  const textureList = [
    { id: 'none', name: 'Matte Finish' },
    { id: 'wood', name: 'Natural Timber' },
    { id: 'marble', name: 'Polished Stone' },
    { id: 'fabric', name: 'Woven Textile' },
    { id: 'metal', name: 'Brushed Steel' },
    { id: 'leather', name: 'Premium Leather' },
    { id: 'concrete', name: 'Raw Concrete' },
    { id: 'glass', name: 'Clear Glass' }
  ];
  
  const modelList = [
    { id: 'desk', name: 'Studio Desk', normalizedScale: 0.8 },
    { id: 'chair', name: 'Task Chair', normalizedScale: 0.8 },
    { id: 'wardrobe', name: 'Wardrobe', normalizedScale: 0.7 },
    { id: 'bookshelf', name: 'Bookshelf', normalizedScale: 0.9 },
    { id: 'bed', name: 'Platform Bed', normalizedScale: 0.5 },
    { id: 'sofa', name: 'Lounge Sofa', normalizedScale: 0.6 },
    { id: 'table', name: 'Dining Table', normalizedScale: 0.8 },
    { id: 'cabinet', name: 'Storage Cabinet', normalizedScale: 0.8 },
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
          case 'w': e.preventDefault(); transformControlsRef.current.setMode('translate'); setTransformMode('translate'); break;
          case 'e': e.preventDefault(); transformControlsRef.current.setMode('rotate'); setTransformMode('rotate'); break;
          case 'r': e.preventDefault(); transformControlsRef.current.setMode('scale'); setTransformMode('scale'); break;
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
    fireToast(`${newMode === 'customize' ? 'Studio' : 'Layout'} View`, 'info');
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
    fireToast(`Added ${type}`, 'success');
    if (userType === 'cvd') announceToScreenReader(`Added ${type} to room`);
  };

  const removeSelectedFurniture = () => {
    if (selectedFurniture) {
      const item = furnitureItems.find(f => f.id === selectedFurniture);
      setFurnitureItems(prev => prev.filter(item => item.id !== selectedFurniture));
      handleDeselect();
      fireToast('Removed from scene', 'info');
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

  const resetLayout = () => { setFurnitureItems([]); handleDeselect(); fireToast('Layout cleared', 'info'); };
  const getCurrentNormalizedScale = () => { return modelList.find(m => m.id === currentModel)?.normalizedScale || 0.8; };
  const handleFilterChange = (filterId) => { if (userType === 'normal') setCurrentFilter(filterId); };

  // ========== RENDER UI ==========
  if (isLoading) return <div className="app-container" style={{justifyContent:'center', alignItems:'center'}}>Initializing...</div>;

  return (
    <div className="app-container">
      <div id="sr-announcer" className="sr-only" aria-live="polite"></div>
      <ToastContainer toasts={toasts} />

      {/* BACKGROUND: Full Bleed 3D Canvas */}
      <section className="canvas-container">
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
              <RoomLayout wallColor={wallColor} floorTexture={floorTexture} />
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

        {/* Floating Badges pinned to the bottom left of the Canvas layer */}
        <div className="canvas-overlay-badges">
          <span className="badge">{mode === 'layout' ? 'Layout Mode' : 'Studio Mode'}</span>
          
          {mode === 'customize' && <span className="badge" style={{background: 'var(--primary)', color: 'var(--bg-color)'}}>{modelList.find(m => m.id === currentModel)?.name}</span>}
          {mode === 'customize' && userType === 'normal' && currentFilter !== 'none' && <span className="badge" style={{background: 'var(--danger)', color: '#fff'}}>Lens: {cvdSimulationFilters.find(f => f.id === currentFilter)?.name}</span>}
          
          {mode === 'layout' && selectedFurniture && <span className="badge" style={{background: 'var(--text-main)', color: 'var(--bg-color)'}}>Editing: {furnitureItems.find(f => f.id === selectedFurniture)?.type}</span>}
        </div>
      </section>

      {/* FOREGROUND: Floating UI Panels */}
      <div className="ui-layer">
        {/* Top Left Header */}
        <div>
          <header className="app-header">
            <div className="header-brand">
              <h1>DesignEyes</h1>
            </div>
            
            <div className="header-controls">
              {/* Workspace Mode */}
              <div style={{ display: 'flex', background: 'var(--border-fine)', borderRadius: '99px', padding: '4px' }}>
                 <button className={`btn ${mode === 'customize' ? 'btn-primary' : ''}`} style={{border: 'none'}} onClick={() => handleModeChange('customize')} aria-pressed={mode === 'customize'}>Studio</button>
                 <button className={`btn ${mode === 'layout' ? 'btn-primary' : ''}`} style={{border: 'none'}} onClick={() => handleModeChange('layout')} aria-pressed={mode === 'layout'}>Layout</button>
              </div>

              <div style={{width: '1px', height: '24px', background: 'var(--border-fine)', margin: '0 0.5rem'}}></div>

              {/* User Type */}
              <Tooltip text={userType === 'normal' ? "Switch to Accessible CVD Tools" : "Switch to Standard Designer Tools"}>
                 <button className={`btn ${userType === 'cvd' ? 'btn-primary' : ''}`} onClick={() => handleUserTypeChange(userType === 'normal' ? 'cvd' : 'normal')} aria-pressed={userType === 'cvd'}>
                   {userType === 'normal' ? 'Standard' : 'Inclusive'}
                 </button>
              </Tooltip>

              {/* High Contrast */}
              <Tooltip text="High Contrast Overlay">
                 <button className={`btn ${highContrast ? 'btn-primary' : ''}`} onClick={() => setHighContrast(!highContrast)} aria-pressed={highContrast}>Contrast</button>
              </Tooltip>

              <button 
                className="btn" 
                onClick={() => window.open('YOUR_GOOGLE_FORM_URL_HERE', '_blank', 'noopener,noreferrer')}
              >
                Feedback
              </button>
            </div>
          </header>
        </div>

        {/* Right Sidebar */}
        <aside className="sidebar">
          {mode === 'customize' ? (
            <>
              {/* 1. Model Selection */}
              <div className="control-group animate-fade-in">
                <h3>Collection</h3>
                <div className="grid-2col">
                  {modelList.map(m => (
                    <button key={m.id} className={`selectable-card ${currentModel === m.id ? 'active' : ''}`} onClick={() => handleModelChange(m.id)}>
                      {m.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Coloring */}
              <div className="control-group animate-fade-in" style={{animationDelay: '0.1s'}}>
                <h3>Materials & Colors</h3>
                {!selectedSection && <p style={{fontSize:'0.85rem', color:'var(--text-muted)'}}>Select a part on the 3D model to apply color.</p>}
                {selectedSection && <p style={{fontSize:'0.85rem', color:'var(--primary)'}}>Selected: <strong>{selectedSection}</strong></p>}
                
                <div className="grid-4col" style={{marginTop: '0.5rem'}}>
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

                <div className="grid-2col" style={{marginTop: '1rem'}}>
                  {textureList.map(t => (
                    <button key={t.id} className={`btn ${currentTexture === t.id ? 'btn-primary' : ''}`} onClick={() => setCurrentTexture(t.id)}>
                      {t.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. CVD Filters */}
              {userType === 'normal' && (
                <div className="control-group animate-fade-in" style={{animationDelay: '0.2s'}}>
                  <h3>Vision Lenses</h3>
                  <select className="btn" style={{width: '100%', textAlign: 'left', padding: '0.8rem'}} value={currentFilter} onChange={(e) => handleFilterChange(e.target.value)}>
                    {cvdSimulationFilters.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                  </select>
                </div>
              )}

              {/* Quick Actions */}
              <div className="control-group animate-fade-in" style={{animationDelay: '0.3s', marginTop: 'auto'}}>
                <div className="grid-2col">
                  <button className="btn btn-danger" onClick={resetAllCustomizations}>Clear All</button>
                  <button className="btn" onClick={resetToDefault}>Reset Lens</button>
                </div>
              </div>
            </>
          ) : (
             <div className="control-group animate-fade-in">
               <h3>Add Furniture</h3>
               <div className="grid-2col">
                 {modelList.map(m => (
                   <button key={m.id} className="btn" style={{fontSize:'0.8rem'}} onClick={() => addFurnitureItem(m.id)}>
                     + {m.name}
                   </button>
                 ))}
               </div>

               {selectedFurniture && (
                 <div style={{background: 'var(--surface-solid)', padding: '1rem', borderRadius: 'var(--radius-card)', border: 'var(--border-fine)', marginTop: '1rem'}}>
                   <h3 style={{borderBottom: 'none', padding: 0, marginBottom: '0.75rem'}}>Transform</h3>
                   <div style={{display: 'flex', gap: '0.5rem'}}>
                      <button className={`btn ${transformMode === 'translate' ? 'btn-primary' : ''}`} style={{flex: 1}} onClick={() => { setTransformMode('translate'); if(transformControlsRef.current) transformControlsRef.current.setMode('translate');}}>Move</button>
                      <button className={`btn ${transformMode === 'rotate' ? 'btn-primary' : ''}`} style={{flex: 1}} onClick={() => { setTransformMode('rotate'); if(transformControlsRef.current) transformControlsRef.current.setMode('rotate');}}>Rotate</button>
                   </div>
                   
                   <h3 style={{borderBottom: 'none', padding: 0, margin: '1rem 0 0.5rem 0'}}>Scale</h3>
                   <div style={{display: 'flex', gap: '0.5rem', alignItems: 'center'}}>
                     <button className="btn" style={{flex: 1}} onClick={() => adjustSelectedFurnitureScale(-0.1)} aria-label="Decrease size">-</button>
                     <span style={{fontSize: '0.85rem', fontWeight: 500, width: '40px', textAlign: 'center'}}>
                       {Math.round((furnitureItems.find(f => f.id === selectedFurniture)?.scale || 1) * 100)}%
                     </span>
                     <button className="btn" style={{flex: 1}} onClick={() => adjustSelectedFurnitureScale(0.1)} aria-label="Increase size">+</button>
                   </div>
                 </div>
               )}
               
               {/* Room Environment Finishes */}
               <h3 style={{marginTop: '1.5rem'}}>Room Finishes</h3>
               <div>
                 <p style={{fontSize: '0.8rem', marginBottom: '0.5rem', color: 'var(--text-muted)'}}>Wall Paint</p>
                 <div className="grid-4col">
                   {sectionColorPalette.slice(0, 8).map(hex => (
                     <Tooltip key={`wall-${hex}`} text="Apply Wall Color">
                       <button 
                         className={`color-swatch ${wallColor === hex ? 'active' : ''}`} 
                         style={{ backgroundColor: hex }} 
                         onClick={() => setWallColor(hex)} 
                       />
                     </Tooltip>
                   ))}
                 </div>
               </div>

               <div>
                 <p style={{fontSize: '0.8rem', marginTop: '1rem', marginBottom: '0.5rem', color: 'var(--text-muted)'}}>Floor Material</p>
                 <div className="grid-2col">
                   {textureList.map(t => (
                     <button 
                       key={`floor-${t.id}`} 
                       className={`btn ${floorTexture === t.id ? 'btn-primary' : ''}`} 
                       style={{fontSize: '0.8rem'}} 
                       onClick={() => setFloorTexture(t.id)}
                     >
                       {t.id === 'none' ? 'Default Floor' : t.name}
                     </button>
                   ))}
                 </div>
               </div>

               {furnitureItems.length > 0 && (
                 <>
                   <h3 style={{marginTop: '1.5rem'}}>Items in Room</h3>
                   <div style={{maxHeight: '120px', overflowY: 'auto'}}>
                     {furnitureItems.map(item => (
                       <div key={item.id} className={`list-item ${selectedFurniture === item.id ? 'selected' : ''}`} onClick={() => handleFurnitureSelect(item.id)}>
                         <span style={{textTransform: 'capitalize', fontSize: '0.85rem', fontWeight: 500}}>{item.type}</span>
                         <div style={{display: 'flex', gap: '0.5rem'}}>
                           <button className="btn" style={{padding: '0.2rem 0.5rem'}} onClick={(e) => { e.stopPropagation(); toggleFurnitureVisibility(item.id); }}>{item.visible ? 'Hide' : 'Show'}</button>
                           <button className="btn btn-danger" style={{padding: '0.2rem 0.5rem'}} onClick={(e) => { e.stopPropagation(); setSelectedFurniture(item.id); removeSelectedFurniture(); }}>Del</button>
                         </div>
                       </div>
                     ))}
                   </div>
                 </>
               )}

               <div style={{marginTop: 'auto'}}>
                 <button className="btn btn-danger" style={{width: '100%'}} onClick={resetLayout}>Clear Layout</button>
               </div>
             </div>
          )}
        </aside>
      </div>
    </div>
  );
}

export default App;