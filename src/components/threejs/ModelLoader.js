// src/components/threejs/ModelLoader.js
import React, { useEffect, useState, useRef, useMemo } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { TextureLoader } from 'three';

const ModelLoader = ({ 
  modelName, 
  position = [0, 0, 0], 
  scale = 1,
  currentFilter = 'natural',
  currentTexture = 'none',
  primaryColor = '#D4A76A',
  secondaryColor = '#B08D57',
  textureProperties = {}
}) => {
  const [model, setModel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [texture, setTexture] = useState(null);
  const meshRef = useRef();
  
  // Create Three.js colors from hex strings
  const primaryThreeColor = useMemo(() => 
    new THREE.Color(primaryColor), [primaryColor]);
  
  const secondaryThreeColor = useMemo(() => 
    new THREE.Color(secondaryColor), [secondaryColor]);

  // SAFE function to apply colors and textures to a model
  const applyMaterialToModel = (scene) => {
    if (!scene) return;
    
    scene.traverse((child) => {
      if (child.isMesh && child.material) {
        // Store original material if not already stored
        if (!child.userData.originalMaterial) {
          child.userData.originalMaterial = child.material.clone();
        }
        
        // Get appropriate color for this part
        let targetColor;
        
        // Check if we should apply secondary color (for cushions, fabrics, etc.)
        const name = child.name.toLowerCase();
        const materialName = child.material.name ? child.material.name.toLowerCase() : '';
        
        // Determine if this is a cushion/fabric part (secondary color)
        const isSecondary = name.includes('cushion') || 
                           name.includes('seat') || 
                           name.includes('back') ||
                           name.includes('fabric') ||
                           name.includes('upholstery') ||
                           name.includes('leather') ||
                           materialName.includes('fabric') ||
                           materialName.includes('leather') ||
                           materialName.includes('cushion');
        
        targetColor = isSecondary ? secondaryThreeColor : primaryThreeColor;
        
        // SAFE approach: Only modify color property, preserve all other properties
        child.material.color.copy(targetColor);
        
        // Only apply texture if explicitly requested and we have a texture
        if (currentTexture !== 'none' && texture) {
          child.material.map = texture;
          child.material.map.needsUpdate = true;
          
          // Set texture properties
          child.material.map.wrapS = THREE.RepeatWrapping;
          child.material.map.wrapT = THREE.RepeatWrapping;
          child.material.map.repeat.set(
            textureProperties.repeat?.[0] || 1,
            textureProperties.repeat?.[1] || 1
          );
        } else {
          // Ensure no texture is applied if not wanted
          child.material.map = null;
        }
        
        // Apply texture properties if they exist
        if (textureProperties.metalness !== undefined) {
          child.material.metalness = textureProperties.metalness;
        }
        if (textureProperties.roughness !== undefined) {
          child.material.roughness = textureProperties.roughness;
        }
        if (textureProperties.transparent !== undefined) {
          child.material.transparent = textureProperties.transparent;
        }
        if (textureProperties.opacity !== undefined) {
          child.material.opacity = textureProperties.opacity;
        }
        
        child.material.needsUpdate = true;
      }
    });
  };

  // Load texture if needed
  useEffect(() => {
    if (currentTexture !== 'none' && textureProperties.imageUrl) {
      const textureLoader = new TextureLoader();
      textureLoader.load(
        textureProperties.imageUrl,
        (loadedTexture) => {
          loadedTexture.wrapS = loadedTexture.wrapT = THREE.RepeatWrapping;
          loadedTexture.repeat.set(
            textureProperties.repeat?.[0] || 1,
            textureProperties.repeat?.[1] || 1
          );
          loadedTexture.anisotropy = 16; // Improve texture quality
          setTexture(loadedTexture);
        },
        undefined,
        (err) => {
          console.warn('Failed to load texture:', err);
          setTexture(null);
        }
      );
    } else {
      setTexture(null);
    }
  }, [currentTexture, textureProperties]);

  useEffect(() => {
    console.log(`Loading model: ${modelName}.glb with filter: ${currentFilter}, texture: ${currentTexture}`);
    setLoading(true);
    setError(null);

    const loader = new GLTFLoader();
    
    loader.load(
      `/models/${modelName}.glb`,
      (gltf) => {
        console.log(`✅ Model ${modelName} loaded successfully!`, gltf);
        
        // IMPORTANT: Don't clone the scene - use it directly to preserve animations/skeletons
        const scene = gltf.scene;
        
        // Center the model if needed
        const box = new THREE.Box3().setFromObject(scene);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        
        // Only center if the model isn't already centered
        if (Math.abs(center.x) > 0.1 || Math.abs(center.y) > 0.1 || Math.abs(center.z) > 0.1) {
          scene.position.x = -center.x;
          scene.position.y = -center.y + (size.y / 2);
          scene.position.z = -center.z;
        }
        
        // Apply scale - but preserve the model's natural scale
        scene.scale.set(scale, scale, scale);
        
        // Apply materials based on current filter and texture
        applyMaterialToModel(scene);
        
        setModel(scene);
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

    // Cleanup - be careful not to dispose materials that might be in use
    return () => {
      if (texture) {
        texture.dispose();
      }
    };
  }, [modelName, scale]);

  // Apply materials when filter or texture changes
  useEffect(() => {
    if (model) {
      applyMaterialToModel(model);
    }
  }, [currentFilter, currentTexture, texture, primaryThreeColor, secondaryThreeColor, textureProperties]);

  // Loading state
  if (loading) {
    return (
      <group position={position}>
        <mesh ref={meshRef}>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial 
            color={primaryThreeColor}
            transparent={true}
            opacity={0.5}
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
      </group>
    );
  }

  // Model loaded successfully
  if (model) {
    return (
      <group position={position} ref={meshRef}>
        <primitive object={model} />
      </group>
    );
  }

  // Fallback
  return null;
};

export default ModelLoader;