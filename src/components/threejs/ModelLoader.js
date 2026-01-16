import React, { useEffect, useState, useRef, useMemo, forwardRef, useImperativeHandle } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { TextureLoader } from 'three';
import { useThree } from '@react-three/fiber';

const ModelLoader = forwardRef(({ 
  modelName, 
  modelId, // Add modelId prop for context
  position = [0, 0, 0], 
  scale = 1,
  normalizedScale = 1, // New: Normalized scale for consistent sizing
  currentFilter = 'white',
  currentTexture = 'none',
  primaryColor = '#FFFFFF',
  secondaryColor = '#F5F5F5',
  primaryEmissive = 0x000000, // Add emissive properties
  secondaryEmissive = 0x000000,
  emissiveIntensity = 0,
  textureProperties = {},
  selectedSection = null,
  sectionColors = {},
  onSectionSelect,
  mode = 'customize' // Add mode prop
}, ref) => {
  const [model, setModel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [texture, setTexture] = useState(null);
  const { camera, gl } = useThree();
  
  // Raycasting setup
  const raycaster = useMemo(() => new THREE.Raycaster(), []);
  const mouse = useMemo(() => new THREE.Vector2(), []);
  
  // Create Three.js colors from hex strings
  const primaryThreeColor = useMemo(() => 
    new THREE.Color(primaryColor), [primaryColor]);
  
  const secondaryThreeColor = useMemo(() => 
    new THREE.Color(secondaryColor), [secondaryColor]);

   const primaryEmissiveColor = useMemo(() => 
    new THREE.Color(primaryEmissive), [primaryEmissive]);
  
  const secondaryEmissiveColor = useMemo(() => 
    new THREE.Color(secondaryEmissive), [secondaryEmissive]);
  
  // Store original colors PER MODEL using modelId as key
  const originalColors = useRef({});
  const originalEmissive = useRef({});
  
  // Track which sections have custom colors PER MODEL
  const customSections = useRef({});

  // Initialize storage for current model
  useEffect(() => {
    if (modelId && !originalColors.current[modelId]) {
      originalColors.current[modelId] = new Map();
      originalEmissive.current[modelId] = new Map();
      customSections.current[modelId] = new Set();
    }
  }, [modelId]);

  // Get current model's storage
  const getCurrentModelStorage = () => {
    if (!modelId) return { colors: new Map(), emissive: new Map(), sections: new Set() };
    return {
      colors: originalColors.current[modelId] || new Map(),
      emissive: originalEmissive.current[modelId] || new Map(),
      sections: customSections.current[modelId] || new Set()
    };
  };

  // Expose methods to parent via ref
  useImperativeHandle(ref, () => ({
    applyColorToSection: (sectionName, color) => {
      return applyColorToSpecificSection(sectionName, color);
    },
    resetSectionColor: (sectionName) => {
      resetSpecificSection(sectionName);
    },
    resetAllColors: () => {
      const storage = getCurrentModelStorage();
      const count = storage.sections.size;
      
      // Clear all stored colors for current model
      storage.colors.clear();
      storage.emissive.clear();
      storage.sections.clear();
      
      // Reset all meshes to their default color based on current filter
      if (model) {
        applyMaterialToModel(model, false); // Don't preserve custom colors
      }
      
      return count;
    },
    getModelInfo: () => {
      return getAvailableSections();
    },
    getAllSections: () => {
      return getAllSectionNames();
    },
    getCurrentCustomizations: () => {
      const storage = getCurrentModelStorage();
      return Array.from(storage.sections);
    }
  }), [model, modelId]);

  // Function to perform raycasting
  const performRaycast = (clientX, clientY) => {
    if (!model || !gl.domElement || mode === 'layout') return null; // Skip in layout mode
    
    // Convert mouse position to normalized device coordinates
    const rect = gl.domElement.getBoundingClientRect();
    mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((clientY - rect.top) / rect.height) * 2 + 1;
    
    // Update the raycaster with camera and mouse position
    raycaster.setFromCamera(mouse, camera);
    
    // Get all intersectable objects from the model
    const intersectableObjects = [];
    model.traverse((child) => {
      if (child.isMesh && child.visible) {
        intersectableObjects.push(child);
      }
    });
    
    // Calculate objects intersecting the picking ray
    const intersects = raycaster.intersectObjects(intersectableObjects, true);
    
    if (intersects.length > 0) {
      const clickedObject = intersects[0].object;
      
      // Find the mesh name (go up the hierarchy if needed)
      let meshName = clickedObject.name;
      let parent = clickedObject.parent;
      
      while (parent && parent !== model) {
        if (!meshName && parent.name && parent.name !== '') {
          meshName = parent.name;
        }
        parent = parent.parent;
      }
      
      const sectionName = meshName || 'unnamed';
      
      if (onSectionSelect) {
        onSectionSelect(sectionName);
      }
      
      return sectionName;
    }
    
    return null;
  };

  // Function to get all available sections in the model
  const getAllSectionNames = () => {
    const sections = new Set();
    if (model) {
      model.traverse((child) => {
        if (child.isMesh && child.name) {
          sections.add(child.name);
        }
      });
    }
    return Array.from(sections);
  };

  // Function to get all available sections (including unnamed)
  const getAvailableSections = () => {
    const sections = new Set();
    if (model) {
      model.traverse((child) => {
        if (child.isMesh) {
          const name = child.name || 'unnamed';
          sections.add(name);
        }
      });
    }
    return Array.from(sections);
  };

  // Function to apply color to a specific section
  const applyColorToSpecificSection = (sectionName, color) => {
    if (!model || !modelId) {
      console.error('[applyColorToSpecificSection] Model not loaded or no modelId');
      return false;
    }
    
    const storage = getCurrentModelStorage();
    const threeColor = new THREE.Color(color);
    let sectionFound = false;
    
    console.log(`[ModelLoader ${modelId}] Applying ${color} to section "${sectionName}"`);
    
    model.traverse((child) => {
      if (child.isMesh && child.material) {
        const meshName = child.name || '';
        if (meshName === sectionName || 
            meshName.toLowerCase().includes(sectionName.toLowerCase())) {
          
          sectionFound = true;
          const meshId = child.uuid;
          
          // Store original color if not already stored
          if (!storage.colors.has(meshId)) {
            storage.colors.set(meshId, child.material.color.clone());
            storage.emissive.set(meshId, {
              color: child.material.emissive.clone(),
              intensity: child.material.emissiveIntensity
            });
            console.log(`[${modelId}] Stored original color for mesh: ${meshName}`);
          }
          
          // Apply the new color
          child.material.color.copy(threeColor);
          
          // Add to custom sections tracking
          storage.sections.add(meshName || sectionName);
          
          child.material.needsUpdate = true;
          
          console.log(`[${modelId}] Applied color to: "${meshName}"`);
        }
      }
    });
    
    if (!sectionFound) {
      console.warn(`[${modelId}] Section "${sectionName}" not found in model`);
    }
    
    return sectionFound;
  };

  // Function to reset a specific section to its original color
  const resetSpecificSection = (sectionName) => {
    if (!model || !modelId) return;
    
    const storage = getCurrentModelStorage();
    let resetCount = 0;
    
    model.traverse((child) => {
      if (child.isMesh && child.material) {
        const meshName = child.name || '';
        if (meshName === sectionName || 
            meshName.toLowerCase().includes(sectionName.toLowerCase())) {
          
          const meshId = child.uuid;
          const originalColor = storage.colors.get(meshId);
          const originalEmissiveData = storage.emissive.get(meshId);
          
          if (originalColor) {
            child.material.color.copy(originalColor);
          }
          
          if (originalEmissiveData) {
            child.material.emissive.copy(originalEmissiveData.color);
            child.material.emissiveIntensity = originalEmissiveData.intensity;
          } else {
            child.material.emissive = new THREE.Color(0x000000);
            child.material.emissiveIntensity = 0;
          }
          
          child.material.needsUpdate = true;
          resetCount++;
          
          // Remove from stored originals
          storage.colors.delete(meshId);
          storage.emissive.delete(meshId);
          
          // Remove from custom sections tracking
          storage.sections.delete(meshName || sectionName);
          
          console.log(`[${modelId}] Reset mesh: "${meshName}"`);
        }
      }
    });
    
    console.log(`[${modelId}] Reset ${resetCount} meshes for section "${sectionName}"`);
  };

  // Check if a section has custom color
  const hasCustomColor = (meshName) => {
    if (!meshName || !modelId) return false;
    
    const storage = getCurrentModelStorage();
    
    if (storage.sections.has(meshName)) {
      return true;
    }
    
    for (const customSection of storage.sections) {
      if (meshName.toLowerCase().includes(customSection.toLowerCase()) || 
          customSection.toLowerCase().includes(meshName.toLowerCase())) {
        return true;
      }
    }
    
    return false;
  };

  // Apply colors and textures to a model (preserves custom colors)
   const applyMaterialToModel = (scene, preserveCustomColors = true) => {
    if (!scene) return;
    
    const storage = getCurrentModelStorage();
    
    scene.traverse((child) => {
      if (child.isMesh && child.material) {
        // Ensure material is MeshStandardMaterial for better lighting
        if (!(child.material instanceof THREE.MeshStandardMaterial)) {
          child.material = new THREE.MeshStandardMaterial({
            color: child.material.color,
            map: child.material.map,
            transparent: child.material.transparent,
            opacity: child.material.opacity,
            roughness: 0.8,
            metalness: 0.1
          });
        }
        
        const meshName = child.name || '';
        const isCustomized = preserveCustomColors && hasCustomColor(meshName);
        
        // SKIP custom colored sections if we're preserving them
        if (isCustomized) {
          // Keep the custom color - don't override it
          if (currentTexture !== 'none' && texture) {
            child.material.map = texture;
            child.material.map.needsUpdate = true;
            
            child.material.map.wrapS = THREE.RepeatWrapping;
            child.material.map.wrapT = THREE.RepeatWrapping;
            child.material.map.repeat.set(
              textureProperties.repeat?.[0] || 1,
              textureProperties.repeat?.[1] || 1
            );
          } else {
            child.material.map = null;
          }
        } else {
          // Apply default color logic for non-customized sections
          const name = child.name ? child.name.toLowerCase() : '';
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
          
          const targetColor = isSecondary ? secondaryThreeColor : primaryThreeColor;
          const targetEmissive = isSecondary ? secondaryEmissiveColor : primaryEmissiveColor;
          
          // Apply the color
          child.material.color.copy(targetColor);
          
          // Apply emissive for better visibility (especially for dark colors)
          child.material.emissive.copy(targetEmissive);
          child.material.emissiveIntensity = emissiveIntensity;
          
          // Apply texture if needed
          if (currentTexture !== 'none' && texture) {
            child.material.map = texture;
            child.material.map.needsUpdate = true;
            
            child.material.map.wrapS = THREE.RepeatWrapping;
            child.material.map.wrapT = THREE.RepeatWrapping;
            child.material.map.repeat.set(
              textureProperties.repeat?.[0] || 1,
              textureProperties.repeat?.[1] || 1
            );
          } else {
            child.material.map = null;
          }
        }
        
        // Apply texture properties if they exist (always apply these)
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
        if (textureProperties.emissiveIntensity !== undefined) {
          child.material.emissiveIntensity = textureProperties.emissiveIntensity;
        }
        
        // Set envMap intensity for better reflections
        if (textureProperties.envMapIntensity !== undefined) {
          child.material.envMapIntensity = textureProperties.envMapIntensity;
        }
        
        // Ensure materials are properly updated
        child.material.needsUpdate = true;
        
        // Enable shadow casting for better depth perception
        child.castShadow = true;
        child.receiveShadow = true;
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
          loadedTexture.anisotropy = 16;
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

  // Setup pointer events for the canvas (only in customize mode)
  useEffect(() => {
    if (!model || !gl.domElement || mode === 'layout') return; // Don't setup raycaster in layout mode
    
    const handlePointerDown = (event) => {
      if (!model || event.button !== 0) return;
      
      const rect = gl.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      
      raycaster.setFromCamera(mouse, camera);
      
      const intersectableObjects = [];
      model.traverse((child) => {
        if (child.isMesh && child.visible) {
          intersectableObjects.push(child);
        }
      });
      
      const intersects = raycaster.intersectObjects(intersectableObjects, true);
      
      if (intersects.length > 0) {
        event.preventDefault();
        event.stopPropagation();
        
        const clickedObject = intersects[0].object;
        
        let meshName = clickedObject.name;
        let currentParent = clickedObject.parent;
        
        while (currentParent && currentParent !== model) {
          if (currentParent.name && currentParent.name !== '' && !meshName) {
            meshName = currentParent.name;
          }
          currentParent = currentParent.parent;
        }
        
        const sectionName = meshName || 'unnamed';
        
        if (onSectionSelect) {
          onSectionSelect(sectionName);
        }
      }
    };
    
    const canvas = gl.domElement;
    canvas.addEventListener('pointerdown', handlePointerDown);
    
    return () => {
      canvas.removeEventListener('pointerdown', handlePointerDown);
    };
  }, [model, gl, camera, raycaster, mouse, onSectionSelect, mode]);

  useEffect(() => {
    console.log(`[ModelLoader] Loading model: ${modelName} (ID: ${modelId})`);
    setLoading(true);
    setError(null);

    const loader = new GLTFLoader();
    
    loader.load(
      `/models/${modelName}.glb`,
      (gltf) => {
        console.log(`[ModelLoader] ✅ Model ${modelName} (ID: ${modelId}) loaded successfully!`);
        
        const scene = gltf.scene;
        
        // Center the model
        const box = new THREE.Box3().setFromObject(scene);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        
        // Calculate the largest dimension for normalization
        const maxDimension = Math.max(size.x, size.y, size.z);
        
        // Calculate normalized scale to make all models approximately 2 units in largest dimension
        const targetSize = 2.0; // Target size for all models
        const normalizedScaleFactor = targetSize / maxDimension;
        
        // Apply combined scale (normalization + user scale)
        const finalScale = normalizedScaleFactor * normalizedScale;
        
        if (Math.abs(center.x) > 0.1 || Math.abs(center.y) > 0.1 || Math.abs(center.z) > 0.1) {
          scene.position.x = -center.x;
          scene.position.y = -center.y + (size.y / 2);
          scene.position.z = -center.z;
        }
        
        scene.scale.set(finalScale, finalScale, finalScale);
        
        applyMaterialToModel(scene, true);
        
        setModel(scene);
        setLoading(false);
      },
      (progress) => {
        if (progress.lengthComputable) {
          const percentComplete = (progress.loaded / progress.total) * 100;
          console.log(`[ModelLoader] Loading ${modelName}: ${Math.round(percentComplete)}%`);
        }
      },
      (error) => {
        console.error(`[ModelLoader] ❌ Failed to load model ${modelName}:`, error);
        setError(error.message);
        setLoading(false);
      }
    );

    return () => {
      if (texture) {
        texture.dispose();
      }
      // Clean up model-specific storage when component unmounts?
      // Note: We keep storage for potential future use of same model
    };
  }, [modelName, modelId, normalizedScale]);

  // Apply materials when filter or texture changes
  useEffect(() => {
    if (model) {
      applyMaterialToModel(model, true);
    }
  }, [currentFilter, currentTexture, texture, primaryThreeColor, secondaryThreeColor, textureProperties, model]);

  // Apply section colors from props (model-specific)
  useEffect(() => {
    if (model && sectionColors && modelId) {
      console.log(`[${modelId}] Applying section colors from props:`, sectionColors);
      Object.entries(sectionColors).forEach(([section, color]) => {
        applyColorToSpecificSection(section, color);
      });
    }
  }, [sectionColors, model, modelId]);

  // Loading state
  if (loading) {
    return (
      <group position={position}>
        <mesh>
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
      <group position={position}>
        <primitive object={model} />
      </group>
    );
  }

  return null;
});

ModelLoader.displayName = 'ModelLoader';
export default ModelLoader;