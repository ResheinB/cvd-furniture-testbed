// src/App.js
import React, { useState } from 'react';
import './App.css';
import SceneManager from './components/threejs/SceneManager';
import TaskManager from './components/ui/TaskManager';
import ModelSelector from './components/ui/ModelSelector';


function App() {
  const [currentModel, setCurrentModel] = useState('bookshelf');
  const [currentTask, setCurrentTask] = useState(null);
  const [studyProgress, setStudyProgress] = useState(0);
  

  return (
    <div className="App">
      <header className="app-header">
        <h1>3D Furniture Accessibility Study</h1>
        <div className="progress-indicator">
          Progress: {studyProgress}%
        </div>
      </header>
      
      <div className="main-container">
        <div className="scene-container">
          <SceneManager currentModel={currentModel} />
        </div>
        
        <div className="control-panel">
          <ModelSelector 
            currentModel={currentModel}
            onModelChange={setCurrentModel}
          />

          <TaskManager 
            currentTask={currentTask}
            onTaskComplete={(result) => {
              console.log('Task completed:', result);
              setStudyProgress(prev => Math.min(prev + 20, 100));
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default App;