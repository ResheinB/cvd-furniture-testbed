// frontend/src/components/threejs/FurnitureModel.js
import React, { useState } from 'react';
import ModelLoader from './ModelLoader';

const furnitureModels = {
  bedsideTable: {
    name: 'BedsideTable',
    type: 'storage',
    scale: 1.5,
    position: [0, 1, 0]
  },
  coffeeTable: {
    name: 'CoffeeTable',
    type: 'storage', 
    scale: 1.2,
    position: [0, 0.5, 0]
  },
  counter: {
    name: 'Counter',
    type: 'seating',
    scale: 1,
    position: [0, 0, 0]
  },
  sofa: {
    name: 'Sofa',
    type: 'surface',
    scale: 1,
    position: [0, 0.5, 0]
  }
};

const FurnitureModel = ({ currentModel }) => {
  // DEBUG: Log what we're receiving
  console.log('FurnitureModel - currentModel:', currentModel);
  console.log('Available models:', Object.keys(furnitureModels));
  
  
  let modelConfig;
  
  if (currentModel && furnitureModels[currentModel]) {
    modelConfig = furnitureModels[currentModel];
  } else {
    console.warn(`Model "${currentModel}" not found, defaulting to bedsideTable`);
    modelConfig = furnitureModels.bookshelf;
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


FurnitureModel.defaultProps = {
  currentModel: 'bedsideTable'
};

export default FurnitureModel;