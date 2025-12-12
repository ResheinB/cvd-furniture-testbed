// frontend/src/components/ui/ModelSelector.js
import React from 'react';

const ModelSelector = ({ currentModel, onModelChange }) => {
  const models = [
    { id: 'bedsideTable', name: 'BedsideTable', type: 'Control' },
    { id: 'coffeeTable', name: 'CoffeeTable', type: 'Control' },
    { id: 'counter', name: 'Counter', type: 'Intervention' },
    { id: 'sofa', name: 'Sofa', type: 'Intervention' }
  ];

  return (
    <div className="model-selector">
      <h3>Select 3D Model</h3>
      <div className="model-grid">
        {models.map((model) => (
          <button
            key={model.id}
            className={`model-button ${currentModel === model.id ? 'active' : ''}`}
            onClick={() => onModelChange(model.id)}
          >
            <div className="model-thumbnail">
              {/* You can add thumbnail images later */}
              <div className="model-placeholder">{model.name.charAt(0)}</div>
            </div>
            <div className="model-info">
              <strong>{model.name}</strong>
              <span className="model-type">{model.type}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ModelSelector;