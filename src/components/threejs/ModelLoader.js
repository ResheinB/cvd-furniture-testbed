// frontend/src/components/threejs/ModelLoader.js
import React, { useEffect, useState } from 'react';
import { useLoader } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

const ModelLoader = ({ modelName, position = [0, 0, 0], scale = 1 }) => {
  const [model, setModel] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadModel = async () => {
      try {
        console.log(`Loading model: ${modelName}.glb`);
        const loader = new GLTFLoader();
        
        loader.load(
          `/models/${modelName}.glb`,
          (gltf) => {
            console.log(`Model ${modelName} loaded successfully`);
            setModel(gltf.scene);
          },
          (progress) => {
            // Progress callback (optional)
            console.log(`Loading ${modelName}: ${(progress.loaded / progress.total * 100)}%`);
          },
          (error) => {
            console.error(`Failed to load model ${modelName}:`, error);
            setError(error.message);
          }
        );
      } catch (error) {
        console.error('Error in loadModel:', error);
        setError(error.message);
      }
    };

    loadModel();
  }, [modelName]);

  if (error) {
    return (
      <mesh position={position}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="red" />
        <text position={[0, 1.5, 0]}>Error loading {modelName}</text>
      </mesh>
    );
  }

  if (!model) {
    // Loading placeholder
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