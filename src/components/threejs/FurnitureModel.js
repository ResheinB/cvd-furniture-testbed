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
  const modelConfig = furnitureModels[currentModel] || furnitureModels.bookshelf;
  
  return (
    <ModelLoader
      modelName={currentModel}
      position={modelConfig.position}
      scale={modelConfig.scale}
    />
  );
};

export default FurnitureModel;