import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';

const RoomLayout = ({ wallColor = "#e8e8e8", floorTexture = "none" }) => {
  // Room dimensions
  const roomSize = 5;
  const wallHeight = 2;
  const floorThickness = 0;

  const [floorMap, setFloorMap] = useState(null);
  const materialRef = useRef();

  // Fallback material properties in case the image files are missing
  const getMaterialProps = (textureType) => {
    switch(textureType) {
      case 'wood': return { color: '#8B5A2B', roughness: 0.7, metalness: 0.1 };
      case 'marble': return { color: '#f0f0f0', roughness: 0.1, metalness: 0.1 };
      case 'fabric': return { color: '#cccccc', roughness: 1.0, metalness: 0.0 };
      case 'metal': return { color: '#888888', roughness: 0.3, metalness: 0.8 };
      case 'leather': return { color: '#5c4033', roughness: 0.8, metalness: 0.1 };
      case 'concrete': return { color: '#808080', roughness: 0.9, metalness: 0.1 };
      case 'glass': return { color: '#e0f7fa', roughness: 0.1, metalness: 0.9, transparent: true, opacity: 0.6 };
      default: return { color: "#f5f5f5", roughness: 0.8, metalness: 0.1 };
    }
  };

  const materialProps = getMaterialProps(floorTexture);

  useEffect(() => {
    // If 'none' is selected, clear the map and force material update immediately
    if (floorTexture === 'none') {
      setFloorMap(null);
      if (materialRef.current) materialRef.current.needsUpdate = true;
      return;
    }

    const textureUrls = {
      'wood': '/textures/Wood1.jpg',
      'marble': '/textures/marble.jpg',
      'fabric': '/textures/fabric.jpg',
      'metal': '/textures/metal.jpg',
      'leather': '/textures/leather.jpg',
      'concrete': '/textures/concrete.jpg',
      'glass': '/textures/glass.jpg'
    };

    const url = textureUrls[floorTexture];
    
    if (url) {
      const loader = new THREE.TextureLoader();
      loader.load(
        url, 
        (texture) => {
          texture.wrapS = THREE.RepeatWrapping;
          texture.wrapT = THREE.RepeatWrapping;
          texture.repeat.set(roomSize, roomSize); // Scale to fit floor
          setFloorMap(texture);
          
          if (materialRef.current) materialRef.current.needsUpdate = true;
        }, 
        undefined, 
        (err) => {
          console.warn(`Could not load floor texture: ${url}. Falling back to solid material colors.`, err);
          setFloorMap(null); 
          if (materialRef.current) materialRef.current.needsUpdate = true;
        }
      );
    } else {
      setFloorMap(null);
      if (materialRef.current) materialRef.current.needsUpdate = true;
    }

    return () => {
      if (floorMap) floorMap.dispose();
    };
  }, [floorTexture, roomSize]);

  return (
    <group>
      {/* Floor */}
      <mesh 
        position={[0, -floorThickness/2, 0]} 
        rotation={[-Math.PI/2, 0, 0]}
        receiveShadow
      >
        <planeGeometry args={[roomSize, roomSize]} />
        <meshStandardMaterial 
          ref={materialRef}
          color={floorMap ? "#ffffff" : materialProps.color}
          map={floorMap}
          roughness={materialProps.roughness}
          metalness={materialProps.metalness}
          transparent={materialProps.transparent || false}
          opacity={materialProps.opacity || 1}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Grid on floor */}
      <gridHelper 
        args={[roomSize, roomSize, 0x444444, 0x888888]} 
        position={[0, 0.01, 0]}
      />

      {/* Back wall */}
      <mesh 
        position={[0, wallHeight/2, -roomSize/2]} 
        receiveShadow
      >
        <boxGeometry args={[roomSize, wallHeight, 0.2]} />
        <meshStandardMaterial 
          color={wallColor}
          roughness={0.9}
          metalness={0}
        />
      </mesh>

      {/* Right wall */}
      <mesh 
        position={[roomSize/2, wallHeight/2, 0]} 
        receiveShadow
      >
        <boxGeometry args={[0.2, wallHeight, roomSize]} />
        <meshStandardMaterial 
          color={wallColor}
          roughness={0.9}
          metalness={0}
        />
      </mesh>
      
    </group>
  );
};

export default RoomLayout;