import React, { forwardRef, useImperativeHandle, useMemo, useEffect } from 'react';
import { useGLTF, Center } from '@react-three/drei';
import * as THREE from 'three';

const ModelLoader = forwardRef(({
  modelId,
  position = [0, 0, 0],
  scale = 1,
  normalizedScale = 1,
  currentFilter,
  currentTexture,
  primaryColor,
  secondaryColor,
  textureProperties,
  selectedSection,
  sectionColors = {},
  onSectionSelect,
  mode
}, ref) => {
  
  // 1. Load the 3D geometry
  const { scene } = useGLTF(`/models/${modelId || 'desk'}.glb`);

  // 2. Clone the scene so multiple of the same furniture don't share identical materials
  const clonedScene = useMemo(() => {
    const clone = scene.clone();
    clone.traverse((child) => {
      if (child.isMesh) {
        // Give each mesh its own unique material instance
        child.material = child.material.clone();
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    return clone;
  }, [scene]);

  // 3. Apply textures, colors, and highlights whenever state changes
  useEffect(() => {
    if (!clonedScene) return;

    // Pre-load texture if the user selected one (wood, marble, etc.)
    let textureMap = null;
    if (textureProperties?.imageUrl) {
      const textureLoader = new THREE.TextureLoader();
      textureMap = textureLoader.load(textureProperties.imageUrl);
      textureMap.wrapS = THREE.RepeatWrapping;
      textureMap.wrapT = THREE.RepeatWrapping;
      if (textureProperties.repeat) {
        textureMap.repeat.set(textureProperties.repeat[0], textureProperties.repeat[1]);
      }
    }

    clonedScene.traverse((child) => {
      if (child.isMesh) {
        // A. Apply Color (Customized section or fallback to primary)
        if (sectionColors[child.name]) {
          child.material.color.set(sectionColors[child.name]);
        } else {
          child.material.color.set(primaryColor || '#FFFFFF');
        }

        // B. Apply Textures and Physical Properties
        child.material.map = textureMap;
        child.material.roughness = textureProperties?.roughness ?? 0.8;
        child.material.metalness = textureProperties?.metalness ?? 0.1;
        child.material.envMapIntensity = textureProperties?.envMapIntensity ?? 1;
        
        // C. Handle Glass / Transparency
        if (textureProperties?.transparent) {
          child.material.transparent = true;
          child.material.opacity = textureProperties.opacity ?? 1;
        } else {
          child.material.transparent = false;
          child.material.opacity = 1;
        }

        // D. Highlight the specific part the user is customizing
        if (mode === 'customize' && selectedSection === child.name) {
          child.material.emissive.setHex(0x444444); // Glow slightly
        } else {
          child.material.emissive.setHex(0x000000);
        }

        child.material.needsUpdate = true;
      }
    });
  }, [clonedScene, sectionColors, textureProperties, primaryColor, mode, selectedSection]);

  // 4. Handle Raycasting (Clicking on specific parts of the chair/desk)
  const handlePointerDown = (e) => {
    if (mode === 'customize' && onSectionSelect) {
      e.stopPropagation(); // Prevent clicking through the model
      onSectionSelect(e.object.name);
    }
  };

  const handlePointerOver = (e) => {
    if (mode === 'customize') {
      e.stopPropagation();
      document.body.style.cursor = 'crosshair';
    }
  };

  const handlePointerOut = (e) => {
    if (mode === 'customize') {
      e.stopPropagation();
      document.body.style.cursor = 'auto';
    }
  };

  // 5. Connect to the API expected by FurnitureModel.js
  useImperativeHandle(ref, () => ({
    getAllSections: () => {
      const sections = [];
      clonedScene.traverse((child) => {
        if (child.isMesh) sections.push(child.name);
      });
      return sections;
    },
    getCurrentCustomizations: () => sectionColors
  }));

  // 6. Render the 3D Model Wrapped in the Center Fix
  return (
    <group position={position} scale={scale * normalizedScale}>
      {/* THE FIX: <Center bottom> forces the geometry to coordinate 0,0,0 */}
      <Center bottom>
        <primitive 
          object={clonedScene} 
          onPointerDown={handlePointerDown}
          onPointerOver={handlePointerOver}
          onPointerOut={handlePointerOut}
        />
      </Center>
    </group>
  );
});

export default ModelLoader;