// src/components/threejs/SceneManager.js
import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import FurnitureModel from './FurnitureModel';

const SceneManager = ({ currentModel }) => {
  return (
    <Canvas camera={{ position: [5, 5, 5], fov: 50 }}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      
      <FurnitureModel model={currentModel} />
      
      <OrbitControls enableZoom={true} enablePan={true} />
      <Environment preset="studio" />
    </Canvas>
  );
};

export default SceneManager;