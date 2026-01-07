// src/components/threejs/ModelLoader.js
import React, { useEffect, useState, useRef, useMemo } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

const ModelLoader = ({ 
  modelName, 
  position = [0, 0, 0], 
  scale = 1,
  currentFilter = 'natural',
  primaryColor = '#D4A76A',
  secondaryColor = '#B08D57'
}) => {
  const [model, setModel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const meshRef = useRef();
  
  // Create Three.js colors from hex strings
  const primaryThreeColor = useMemo(() => 
    new THREE.Color(primaryColor), [primaryColor]);
  
  const secondaryThreeColor = useMemo(() => 
    new THREE.Color(secondaryColor), [secondaryColor]);

  // Function to apply colors to a model
  const applyColorsToModel = (scene) => {
    if (!scene) return;
    
    scene.traverse((child) => {
      if (child.isMesh && child.material) {
        const meshName = child.name.toLowerCase();
        const materialName = child.material.name ? child.material.name.toLowerCase() : '';
        
        // Store original material if not already stored
        if (!child.userData.originalMaterial) {
          child.userData.originalMaterial = child.material.clone();
        }
        
        // Apply color based on naming conventions or material properties
        if (meshName.includes('frame') || 
            meshName.includes('leg') || 
            meshName.includes('base') ||
            meshName.includes('wood') ||
            meshName.includes('primary') ||
            materialName.includes('primary') ||
            materialName.includes('wood') ||
            materialName.includes('frame') ||
            (!meshName.includes('cushion') && 
             !meshName.includes('seat') && 
             !meshName.includes('fabric') &&
             !meshName.includes('back') &&
             !meshName.includes('secondary') &&
             !materialName.includes('secondary'))) {
          // Primary color for main structure
          child.material.color.copy(primaryThreeColor);
        } else {
          // Secondary color for accents, cushions, etc.
          child.material.color.copy(secondaryThreeColor);
        }
        
        // Apply material properties for better appearance
        child.material.metalness = 0.1;
        child.material.roughness = 0.7;
        child.material.needsUpdate = true;
      }
    });
  };

  useEffect(() => {
    console.log(`Loading model: ${modelName}.glb with filter: ${currentFilter}`);
    setLoading(true);
    setError(null);

    const loader = new GLTFLoader();
    
    loader.load(
      `/models/${modelName}.glb`,
      (gltf) => {
        console.log(`✅ Model ${modelName} loaded successfully!`, gltf);
        
        // Clone the scene to avoid mutating the original
        const clonedScene = gltf.scene.clone();
        
        // Center the model
        const box = new THREE.Box3().setFromObject(clonedScene);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        
        clonedScene.position.x = -center.x;
        clonedScene.position.y = -center.y + (size.y / 2);
        clonedScene.position.z = -center.z;
        
        // Apply initial scale
        clonedScene.scale.set(scale, scale, scale);
        
        // Apply colors based on current filter
        applyColorsToModel(clonedScene);
        
        setModel(clonedScene);
        setLoading(false);
      },
      (progress) => {
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
  }, [modelName, scale]);

  // Apply colors when filter changes
  useEffect(() => {
    if (model) {
      applyColorsToModel(model);
    }
  }, [currentFilter, primaryThreeColor, secondaryThreeColor, model]);

  // Loading state - show placeholder with current filter colors
  if (loading) {
    return (
      <group position={position}>
        <mesh ref={meshRef}>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial 
            color={primaryThreeColor}
            metalness={0.1}
            roughness={0.7}
          />
        </mesh>
        <mesh position={[0, 0.8, 0]}>
          <boxGeometry args={[0.8, 0.2, 0.8]} />
          <meshStandardMaterial 
            color={secondaryThreeColor}
            metalness={0.1}
            roughness={0.7}
          />
        </mesh>
      </group>
    );
  }

  // Error state
  if (error) {
    return (
      <group position={position}>
        <mesh>
          <boxGeometry args={[2, 2, 2]} />
          <meshStandardMaterial 
            color="#ff4444"
            emissive="#ff0000"
            emissiveIntensity={0.2}
          />
        </mesh>
        <mesh position={[0, 2, 0]}>
          <boxGeometry args={[1, 0.1, 0.1]} />
          <meshStandardMaterial color="#ff0000" />
        </mesh>
        <mesh position={[0, 1.8, 0]}>
          <boxGeometry args={[0.1, 0.5, 0.1]} />
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
        ref={meshRef}
      />
    );
  }

  // Fallback - show a cube with current filter colors
  return (
    <group position={position}>
      <mesh ref={meshRef}>
        <boxGeometry args={[2, 2, 2]} />
        <meshStandardMaterial 
          color={primaryThreeColor}
          metalness={0.1}
          roughness={0.7}
        />
      </mesh>
      <mesh position={[0, 1.2, 0]}>
        <boxGeometry args={[1.5, 0.3, 1.5]} />
        <meshStandardMaterial 
          color={secondaryThreeColor}
          metalness={0.1}
          roughness={0.7}
        />
      </mesh>
    </group>
  );
};

export default ModelLoader;