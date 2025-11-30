// src/components/ui/ModelSelector.js
import React from 'react';

const ModelSelector = ({ onModelChange, currentModel }) => {
  const models = [
    { id: 'basicCube', name: 'Basic Cube', type: 'control' },
    { id: 'texturedCube', name: 'Textured Cube', type: 'intervention' },
    { id: 'colorCube', name: 'Color-only Cube', type: 'control' }
  ];

  return (
    <div className="model-selector">
      <h3>Select 3D Model</h3>
      <div className="model-buttons">
        {models.map(model => (
          <button
            key={model.id}
            onClick={() => onModelChange(model.id)}
            className={currentModel === model.id ? 'active' : ''}
          >
            {model.name} ({model.type})
          </button>
        ))}
      </div>
    </div>
  );
};

export default ModelSelector;