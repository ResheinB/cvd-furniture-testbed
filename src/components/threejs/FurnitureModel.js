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

const FurnitureModel = ({ currentModel }) => {
  console.log('FurnitureModel - currentModel:', currentModel);
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
  
  return (
    <ModelLoader
      modelName={currentModel || 'bedsideTable'}
      position={modelConfig.position}
      scale={modelConfig.scale}
    />
  );
};

// Update default to match your first model
FurnitureModel.defaultProps = {
  currentModel: 'bedsideTable'
};

export default FurnitureModel;