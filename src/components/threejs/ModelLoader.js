import React, { useState, useEffect } from 'react';
import { useLoader } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

const ModelLoader = ({ modelName, position = [0, 0, 0], scale = 1 }) => {
  const [model, setModel] = useState(null);
  
  useEffect(() => {
    const loadModel = async () => {
      try {
        const gltf = await GLTFLoader.loadAsync(`/models/${modelName}.glb`);
        setModel(gltf.scene);
      } catch (error) {
        console.error('Failed to load model:', error);
      }
    };
    
    loadModel();
  }, [modelName]);

  if (!model) {
    return (
      <mesh position={position}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="gray" wireframe />
      </mesh>
    );
  }

  return <primitive object={model} position={position} scale={scale} />;
};

export default ModelLoader;