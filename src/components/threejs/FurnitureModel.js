// src/components/threejs/FurnitureModel.js
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';

const FurnitureModel = ({ model }) => {
  const meshRef = useRef();

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.5;
    }
  });

  // Simple model rendering based on model type
  const getModel = () => {
    switch (model) {
      case 'texturedCube':
        return (
          <mesh ref={meshRef}>
            <boxGeometry args={[2, 2, 2]} />
            <meshStandardMaterial color="orange" roughness={0.8} />
          </mesh>
        );
      case 'colorCube':
        return (
          <mesh ref={meshRef}>
            <boxGeometry args={[2, 2, 2]} />
            <meshStandardMaterial color="blue" />
          </mesh>
        );
      default: // basicCube
        return (
          <mesh ref={meshRef}>
            <boxGeometry args={[2, 2, 2]} />
            <meshStandardMaterial color="red" />
          </mesh>
        );
    }
  };

  return getModel();
};

export default FurnitureModel;