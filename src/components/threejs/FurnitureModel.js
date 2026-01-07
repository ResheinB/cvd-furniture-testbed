// frontend/src/components/threejs/FurnitureModel.js
import React from 'react';
import ModelLoader from './ModelLoader';

const furnitureModels = {
  bedsideTable: {          
    name: 'Bedside Table',
    position: [0, 1, 0],
    scale: 1.5,
    type: 'furniture'
  },
  coffeeTable: {           
    name: 'Coffee Table',
    position: [0, 0.5, 0],
    scale: 1.2,
    type: 'furniture'
  },
  counter: {               
    name: 'Counter',
    position: [0, 1, 0],
    scale: 1,
    type: 'furniture'
  },
  sofa: {                  
    name: 'Sofa',
    position: [0, 0.5, 0],
    scale: 1,
    type: 'seating'
  },
  wardrobe: {               
    name: 'Wardrobe',
    position: [0, 1, 0],
    scale: 1,
    type: 'furniture'
  },
  nightTable: {
    name: 'Night Table',
    position: [0, 1, 0],
    scale: 1,
    type: 'furniture'
  }
};

// Define color mappings for different filters
const filterColors = {
  natural: { primary: '#D4A76A', secondary: '#B08D57' },
  dark: { primary: '#3C2F2F', secondary: '#2C2222' },
  light: { primary: '#E1C699', secondary: '#D2B48C' },
  white: { primary: '#FFFFFF', secondary: '#F5F5F5' },
  gray: { primary: '#808080', secondary: '#696969' },
  blue: { primary: '#2196F3', secondary: '#1976D2' },
  green: { primary: '#4CAF50', secondary: '#388E3C' },
  red: { primary: '#F44336', secondary: '#D32F2F' },
  prot_red: { primary: '#FF8A65', secondary: '#F4511E' },
  prot_green: { primary: '#81C784', secondary: '#4CAF50' },
  deut_blue: { primary: '#64B5F6', secondary: '#2196F3' },
  deut_yellow: { primary: '#FFD54F', secondary: '#FFC107' },
  trit_blue: { primary: '#4FC3F7', secondary: '#03A9F4' },
  trit_pink: { primary: '#F06292', secondary: '#E91E63' }
};

// Convert hex color to Three.js Color
const hexToColor = (hex) => {
  // Remove # if present
  hex = hex.replace('#', '');
  
  // Parse the hex values
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;
  
  return { r, g, b };
};

// Function to apply color to model materials
const applyColorToModel = (scene, currentFilter) => {
  if (!scene) return;
  
  const colors = filterColors[currentFilter] || filterColors.natural;
  const primaryColor = hexToColor(colors.primary);
  const secondaryColor = hexToColor(colors.secondary);
  
  scene.traverse((child) => {
    if (child.isMesh && child.material) {
      // Check if this is likely a primary or secondary material
      const materialName = child.material.name.toLowerCase();
      const meshName = child.name.toLowerCase();
      
      // Apply color based on naming conventions
      if (meshName.includes('frame') || 
          meshName.includes('leg') || 
          meshName.includes('base') ||
          meshName.includes('primary') ||
          materialName.includes('primary') ||
          (!meshName.includes('cushion') && 
           !meshName.includes('seat') && 
           !meshName.includes('back') &&
           !meshName.includes('secondary'))) {
        // Primary color for main structure
        child.material.color.setRGB(primaryColor.r, primaryColor.g, primaryColor.b);
      } else {
        // Secondary color for accents
        child.material.color.setRGB(secondaryColor.r, secondaryColor.g, secondaryColor.b);
      }
      
      // Apply some material properties for better appearance
      child.material.needsUpdate = true;
    }
  });
};

const FurnitureModel = ({ currentModel, currentFilter = 'natural' }) => {
  console.log('FurnitureModel - currentModel:', currentModel);
  console.log('FurnitureModel - currentFilter:', currentFilter);
  console.log('Available models:', Object.keys(furnitureModels));
  
  // Safely get the model config
  let modelConfig;
  
  if (currentModel && furnitureModels[currentModel]) {
    modelConfig = furnitureModels[currentModel];
  } else {
    console.warn(`Model "${currentModel}" not found, defaulting to bedsideTable`);
    modelConfig = furnitureModels.bedsideTable;
  }
  
  console.log('Using model config:', modelConfig);
  
  // Get colors for the current filter
  const colors = filterColors[currentFilter] || filterColors.natural;
  
  return (
    <ModelLoader
      modelName={currentModel || 'bedsideTable'}
      position={modelConfig.position}
      scale={modelConfig.scale}
      currentFilter={currentFilter}
      onModelLoaded={(scene) => {
        // Apply color when model is loaded
        if (scene) {
          applyColorToModel(scene, currentFilter);
        }
      }}
      primaryColor={colors.primary}
      secondaryColor={colors.secondary}
    />
  );
};

// Update default props
FurnitureModel.defaultProps = {
  currentModel: 'bedsideTable',
  currentFilter: 'natural'
};

// Export helper functions for potential reuse
export { filterColors, applyColorToModel, hexToColor };
export default FurnitureModel;