import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import * as THREE from 'three';
import ModelLoader from './ModelLoader';

const FurnitureModel = forwardRef(({ 
  currentModel, 
  currentFilter = 'white',
  currentTexture = 'none',
  selectedSection = null,
  sectionColors = {},
  onSectionSelect,
  // New props for layout mode
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  normalizedScale = 1, // New: Normalized scale for consistent sizing
  onClick = null,
  isSelected = false,
  mode = 'customize'
}, ref) => {
  const modelLoaderRef = useRef();
  
  // Get texture properties based on texture ID
  const getTextureProperties = () => {
    const textureMap = {
      'none': { 
        imageUrl: null, 
        repeat: [1, 1],
        emissive: 0x000000,
        emissiveIntensity: 0,
        metalness: 0.1,
        roughness: 0.8,
        envMapIntensity: 1
      },
      'wood': { 
        imageUrl: '/textures/wood.jpg',
        repeat: [3, 3],
        roughness: 0.7,
        metalness: 0.1,
        emissive: 0x000000,
        emissiveIntensity: 0,
        envMapIntensity: 1
      },
      'marble': { 
        imageUrl: '/textures/marble.jpg',
        repeat: [2, 2],
        roughness: 0.3,
        metalness: 0.1,
        emissive: 0x000000,
        emissiveIntensity: 0,
        envMapIntensity: 1.2
      },
      'fabric': { 
        imageUrl: '/textures/fabric.jpg',
        repeat: [4, 4],
        roughness: 0.9,
        metalness: 0,
        emissive: 0x000000,
        emissiveIntensity: 0,
        envMapIntensity: 0.8
      },
      'metal': { 
        imageUrl: '/textures/metal.jpg',
        repeat: [5, 5],
        roughness: 0.4,
        metalness: 0.8,
        emissive: 0x000000,
        emissiveIntensity: 0,
        envMapIntensity: 1.5
      },
      'leather': { 
        imageUrl: '/textures/leather.jpg',
        repeat: [3, 3],
        roughness: 0.7,
        metalness: 0.1,
        emissive: 0x000000,
        emissiveIntensity: 0,
        envMapIntensity: 1
      },
      'concrete': { 
        imageUrl: '/textures/concrete.jpg',
        repeat: [2, 2],
        roughness: 0.9,
        metalness: 0,
        emissive: 0x000000,
        emissiveIntensity: 0,
        envMapIntensity: 0.8
      },
      'glass': { 
        imageUrl: '/textures/glass.jpg',
        repeat: [1, 1],
        roughness: 0.1,
        metalness: 0.3,
        transparent: true,
        opacity: 0.7,
        emissive: 0x000000,
        emissiveIntensity: 0,
        envMapIntensity: 2
      }
    };
    
    return textureMap[currentTexture] || textureMap['none'];
  };
  
  // Get colors based on current filter
  const getColorsForFilter = () => {
    const colorMap = {
      // Default white (always available)
      'white': { 
        primary: '#FFFFFF', 
        secondary: '#F5F5F5',
        emissive: 0x000000,
        emissiveIntensity: 0
      },
      
      // CVD colors with emissive properties for better visibility
      'prot_red': { 
        primary: '#FF8A65', 
        secondary: '#F4511E',
        emissive: 0x442211,
        emissiveIntensity: 0.1
      },
      'prot_green': { 
        primary: '#81C784', 
        secondary: '#4CAF50',
        emissive: 0x112211,
        emissiveIntensity: 0.1
      },
      'deut_blue': { 
        primary: '#64B5F6', 
        secondary: '#2196F3',
        emissive: 0x111133,
        emissiveIntensity: 0.1
      },
      'deut_yellow': { 
        primary: '#FFD54F', 
        secondary: '#FFC107',
        emissive: 0x332211,
        emissiveIntensity: 0.1
      },
      'trit_blue': { 
        primary: '#4FC3F7', 
        secondary: '#03A9F4',
        emissive: 0x112233,
        emissiveIntensity: 0.1
      },
      'trit_pink': { 
        primary: '#F06292', 
        secondary: '#E91E63',
        emissive: 0x331122,
        emissiveIntensity: 0.1
      },
      'achroma_bw': { 
        primary: '#FFFFFF', 
        secondary: '#000000',
        emissive: 0x222222,
        emissiveIntensity: 0.2
      },
      'achroma_contrast': { 
        primary: '#808080', 
        secondary: '#333333',
        emissive: 0x111111,
        emissiveIntensity: 0.15
      }
    };
    
    return colorMap[currentFilter] || colorMap['white'];
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

  return (
    <group 
      position={position}
      rotation={rotation}
      scale={scale}
      onClick={(e) => {
        e.stopPropagation(); // Crucial: Stop event from bubbling up to TransformControls
        
        if (mode === 'layout' && onClick) {
          // Only call onClick in layout mode, not customize mode
          onClick();
        } else if (mode === 'customize') {
          // In customize mode, we rely on the raycaster from ModelLoader
          // Don't handle click here
        }
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        if (mode === 'layout') {
          document.body.style.cursor = 'pointer';
        }
      }}
      onPointerOut={() => {
        if (mode === 'layout') {
          document.body.style.cursor = 'move';
        }
      }}
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
      
      <ModelLoader
        modelName={currentModel || 'desk'}
        modelId={currentModel}
        position={[0, 0, 0]}
        scale={1} // Scale is now handled by parent group
        normalizedScale={normalizedScale} // Pass normalized scale
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
        mode={mode} // Pass mode to ModelLoader
        ref={modelLoaderRef}
      />
    </group>
  );
});

FurnitureModel.displayName = 'FurnitureModel';
export default FurnitureModel;