// src/components/threejs/ModelLoader.js
import React, { useEffect, useState, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

const ModelLoader = ({ modelName, position = [0, 0, 0], scale = 1 }) => {
  const [model, setModel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const meshRef = useRef();

  useEffect(() => {
    console.log(`Loading model: ${modelName}.glb`);
    setLoading(true);
    setError(null);

    const loader = new GLTFLoader();
    
    loader.load(
      `/models/${modelName}.glb`,
      (gltf) => {
        console.log(`✅ Model ${modelName} loaded successfully!`, gltf);
        setModel(gltf.scene);
        setLoading(false);
      },
      (progress) => {
        // Progress callback
        if (progress.lengthComputable) {
          const percentComplete = (progress.loaded / progress.total) * 100;
          console.log(`Loading ${modelName}: ${Math.round(percentComplete)}%`);
        }
      },
      (error) => {
        console.error(`❌ Failed to load model ${modelName}:`, error);
        setError(error.message);
        setLoading(false);
      }
    );

    // Cleanup
    return () => {
      if (model) {
        // Dispose of model resources
        model.traverse((child) => {
          if (child.isMesh) {
            if (child.geometry) child.geometry.dispose();
            if (child.material) {
              if (Array.isArray(child.material)) {
                child.material.forEach(material => material.dispose());
              } else {
                child.material.dispose();
              }
            }
          }
        });
      }
    };
  }, [modelName]);

  // Loading state - show placeholder
  if (loading) {
    return (
      <mesh ref={meshRef} position={position}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#888888" wireframe />
      </mesh>
    );
  }

  // Error state
  if (error) {
    return (
      <group position={position}>
        <mesh>
          <boxGeometry args={[2, 2, 2]} />
          <meshStandardMaterial color="#ff4444" />
        </mesh>
        {/* Error text (simplified) */}
        <mesh position={[0, 2, 0]}>
          <boxGeometry args={[0.5, 0.1, 0.01]} />
          <meshStandardMaterial color="#ff0000" />
        </mesh>
      </group>
    );
  }

  // Model loaded successfully
  if (model) {
    return (
      <primitive 
        object={model} 
        position={position}
        scale={scale}
        ref={meshRef}
      />
    );
  }

  // Fallback - show a cube
  return (
    <mesh ref={meshRef} position={position}>
      <boxGeometry args={[2, 2, 2]} />
      <meshStandardMaterial color="#4CAF50" />
    </mesh>
  );
};

export default ModelLoader;