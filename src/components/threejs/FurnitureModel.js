/**
 * Reusable 3D furniture component
 * * Responsibilities:
 * - Load and display 3D furniture models
 * - Handle section selection for coloring
 * - Apply textures and CVD filters
 * - Manage click interactions for both modes
 * - Provide API for color manipulation
 * * Props:
 * - currentModel: Which furniture model to display
 * - currentFilter: CVD filter to apply
 * - currentTexture: Texture to apply
 * - selectedSection: Currently selected section (customize mode)
 * - sectionColors: Color mappings for sections
 * - position/rotation/scale: Transform for layout mode
 * - isSelected: Whether this furniture is selected in layout mode
 * - mode: 'customize' or 'layout'
 */

import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import * as THREE from 'three';
import { Center } from '@react-three/drei'; // <-- Added Center import
import ModelLoader from './ModelLoader';

const FurnitureModel = forwardRef(({ 
  currentModel, 
  currentFilter = 'none',
  currentTexture = 'none',
  selectedSection = null,
  sectionColors = {},
  onSectionSelect,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  normalizedScale = 1,
  onClick = null,
  isSelected = false,
  mode = 'customize'
}, ref) => {
  const modelLoaderRef = useRef();
  const groupRef = useRef();
  
  // Get texture properties based on texture ID
  const getTextureProperties = () => {
    const textureMap = {
      'none': { 
        imageUrl: null, 
        repeat: [1, 1],
        metalness: 0.1,
        roughness: 0.8,
        envMapIntensity: 1
      },
      'wood': { 
        imageUrl: '/textures/Wood1.jpg',
        repeat: [3, 3],
        roughness: 0.7,
        metalness: 0.1,
        envMapIntensity: 1
      },
      'marble': { 
        imageUrl: '/textures/marble.jpg',
        repeat: [2, 2],
        roughness: 0.3,
        metalness: 0.1,
        envMapIntensity: 1.2
      },
      'fabric': { 
        imageUrl: '/textures/fabric.jpg',
        repeat: [4, 4],
        roughness: 0.9,
        metalness: 0,
        envMapIntensity: 0.8
      },
      'metal': { 
        imageUrl: '/textures/metal.jpg',
        repeat: [5, 5],
        roughness: 0.4,
        metalness: 0.8,
        envMapIntensity: 1.5
      },
      'leather': { 
        imageUrl: '/textures/leather.jpg',
        repeat: [3, 3],
        roughness: 0.7,
        metalness: 0.1,
        envMapIntensity: 1
      },
      'concrete': { 
        imageUrl: '/textures/concrete.jpg',
        repeat: [2, 2],
        roughness: 0.9,
        metalness: 0,
        envMapIntensity: 0.8
      },
      'glass': { 
        imageUrl: '/textures/glass.jpg',
        repeat: [1, 1],
        roughness: 0.1,
        metalness: 0.3,
        transparent: true,
        opacity: 0.7,
        envMapIntensity: 2
      }
    };
    
    return textureMap[currentTexture] || textureMap['none'];
  };
  
  // Get default colors (no CVD colors since we use overlays now)
  const getColorsForFilter = () => {
    return { 
      primary: '#FFFFFF', 
      secondary: '#F5F5F5',
      emissive: 0x000000,
      emissiveIntensity: 0
    };
  };
  
  // Expose methods from ModelLoader
  useImperativeHandle(ref, () => {
    return {
      // Color manipulation methods
      applyColorToSection: (sectionName, color) => {
        if (modelLoaderRef.current?.applyColorToSection) {
          return modelLoaderRef.current.applyColorToSection(sectionName, color);
        }
        console.warn('ModelLoader not ready');
        return false;
      },
      resetSectionColor: (sectionName) => {
        if (modelLoaderRef.current?.resetSectionColor) {
          modelLoaderRef.current.resetSectionColor(sectionName);
        }
      },
      resetAllColors: () => {
        if (modelLoaderRef.current?.resetAllColors) {
          return modelLoaderRef.current.resetAllColors();
        }
        return 0;
      },
      
      // Information methods
      getModelInfo: () => {
        if (modelLoaderRef.current?.getModelInfo) {
          return modelLoaderRef.current.getModelInfo();
        }
        return [];
      },
      getAllSections: () => {
        if (modelLoaderRef.current?.getAllSections) {
          return modelLoaderRef.current.getAllSections();
        }
        return [];
      },
      getCurrentCustomizations: () => {
        if (modelLoaderRef.current?.getCurrentCustomizations) {
          return modelLoaderRef.current.getCurrentCustomizations();
        }
        return [];
      }
    };
  }, []);
  
  const colors = getColorsForFilter();
  const textureProperties = getTextureProperties();

  // Handle click with proper event propagation
  const handleClick = (e) => {
    e.stopPropagation(); // Crucial: Prevent event from bubbling to canvas
    
    if (mode === 'layout' && onClick) {
      onClick();
    } else if (mode === 'customize' && onSectionSelect) {
      // In customize mode, we rely on the raycaster from ModelLoader
      // Don't handle click here
    }
  };

  // Handle pointer events for better UX
  const handlePointerOver = (e) => {
    e.stopPropagation();
    if (mode === 'layout') {
      // Only change cursor if not already selected
      if (!isSelected) {
        document.body.style.cursor = 'pointer';
      }
    }
  };

  const handlePointerOut = (e) => {
    e.stopPropagation();
    if (mode === 'layout') {
      // Only reset cursor if not selected and not transforming
      if (!isSelected) {
        document.body.style.cursor = 'grab';
      }
    }
  };

  return (
    <group 
      ref={groupRef}
      position={position}
      rotation={rotation}
      scale={scale}
      onClick={handleClick}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
    >
      {/* Selection highlight in layout mode */}
      {mode === 'layout' && isSelected && (
        <group>
          {/* Bounding box highlight */}
          <mesh position={[0, 0.5, 0]}>
            <boxGeometry args={[1.2, 1, 1.2]} />
            <meshBasicMaterial 
              color="#00ff00" 
              transparent 
              opacity={0.1}
              wireframe={true}
            />
          </mesh>
          {/* Ground indicator */}
          <mesh position={[0, 0.01, 0]} rotation={[-Math.PI/2, 0, 0]}>
            <ringGeometry args={[0.5, 0.7, 32]} />
            <meshBasicMaterial 
              color="#00ff00" 
              transparent 
              opacity={0.3}
              side={THREE.DoubleSide}
            />
          </mesh>
        </group>
      )}
      
      {/* <-- WRAPPED MODEL LOADER IN CENTER COMPONENT --> */}
      <Center bottom>
        <ModelLoader
          modelName={currentModel || 'desk'}
          modelId={currentModel}
          position={[0, 0, 0]}
          scale={1}
          normalizedScale={normalizedScale}
          currentFilter={currentFilter}
          currentTexture={currentTexture}
          primaryColor={colors.primary}
          secondaryColor={colors.secondary}
          primaryEmissive={colors.emissive}
          secondaryEmissive={colors.emissive}
          emissiveIntensity={colors.emissiveIntensity}
          textureProperties={textureProperties}
          selectedSection={selectedSection}
          sectionColors={sectionColors}
          onSectionSelect={onSectionSelect}
          mode={mode}
          ref={modelLoaderRef}
        />
      </Center>
    </group>
  );
});

FurnitureModel.displayName = 'FurnitureModel';
export default FurnitureModel;