// src/components/threejs/FurnitureModel.js
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

// Define texture properties
const textureProperties = {
  none: { 
    type: 'solid',
    repeat: [1, 1],
    roughness: 0.7,
    metalness: 0.1
  },
  wood: { 
    type: 'texture',
    imageUrl: '/textures/wood.jpg',
    repeat: [2, 2],
    roughness: 0.8,
    metalness: 0.05
  },
  marble: { 
    type: 'texture',
    imageUrl: '/textures/marble.jpg',
    repeat: [3, 3],
    roughness: 0.3,
    metalness: 0.1
  },
  fabric: { 
    type: 'texture',
    imageUrl: '/textures/fabric.jpg',
    repeat: [4, 4],
    roughness: 0.9,
    metalness: 0.0
  },
  metal: { 
    type: 'texture',
    imageUrl: '/textures/metal.jpg',
    repeat: [8, 8],
    roughness: 0.2,
    metalness: 0.8
  },
  leather: { 
    type: 'texture',
    imageUrl: '/textures/leather.jpg',
    repeat: [3, 3],
    roughness: 0.6,
    metalness: 0.1
  },
  concrete: { 
    type: 'texture',
    imageUrl: '/textures/concrete.jpg',
    repeat: [2, 2],
    roughness: 0.9,
    metalness: 0.0
  },
  glass: { 
    type: 'texture',
    imageUrl: '/textures/glass.jpg',
    repeat: [1, 1],
    roughness: 0.1,
    metalness: 0.3,
    transparent: true,
    opacity: 0.8
  }
};

const FurnitureModel = ({ currentModel, currentFilter = 'natural', currentTexture = 'none' }) => {
  console.log('FurnitureModel - currentModel:', currentModel);
  console.log('FurnitureModel - currentFilter:', currentFilter);
  console.log('FurnitureModel - currentTexture:', currentTexture);
  
  // Safely get the model config
  let modelConfig;
  
  if (currentModel && furnitureModels[currentModel]) {
    modelConfig = furnitureModels[currentModel];
  } else {
    console.warn(`Model "${currentModel}" not found, defaulting to bedsideTable`);
    modelConfig = furnitureModels.bedsideTable;
  }
  
  // Get colors for the current filter
  const colors = filterColors[currentFilter] || filterColors.natural;
  
  // Get texture properties
  const textureProps = textureProperties[currentTexture] || textureProperties.none;
  
  // SIMPLIFIED: Use consistent scale for all models
  const adjustedScale = 0.8;
  
  // SIMPLIFIED: Use consistent position
  const adjustedPosition = [0, 0, 0];
  
  return (
    <ModelLoader
      modelName={currentModel || 'bedsideTable'}
      position={adjustedPosition}
      scale={adjustedScale}
      currentFilter={currentFilter}
      currentTexture={currentTexture}
      primaryColor={colors.primary}
      secondaryColor={colors.secondary}
      textureProperties={textureProps}
    />
  );
};

// Update default props
FurnitureModel.defaultProps = {
  currentModel: 'bedsideTable',
  currentFilter: 'natural',
  currentTexture: 'none'
};

export { filterColors, textureProperties };
export default FurnitureModel;