import React from 'react';
import * as THREE from 'three';

const RoomLayout = () => {
  // Room dimensions
  const roomSize = 5;
  const wallHeight = 2;
  const floorThickness = 0;

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
          color="#f5f5f5"
          roughness={0.8}
          metalness={0.1}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Grid on floor */}
      <gridHelper 
        args={[roomSize, roomSize, 0x444444, 0x888888]} 
        position={[0, 0.01, 0]}
      />

      {/* Walls */}
      {/* Back wall */}
      <mesh 
        position={[0, wallHeight/2, -roomSize/2]} 
        receiveShadow
      >
        <boxGeometry args={[roomSize, wallHeight, 0.2]} />
        <meshStandardMaterial 
          color="#e8e8e8"
          roughness={0.9}
          metalness={0}
        />
      </mesh>

      {/* Right wall */}
      <mesh 
        position={[roomSize/2, wallHeight/2, 0]} 
        rotation={[0, Math.PI/2, 0]}
        receiveShadow
      >
        <boxGeometry args={[roomSize, wallHeight, 0.2]} />
        <meshStandardMaterial 
          color="#f0f0f0"
          roughness={0.9}
          metalness={0}
        />
      </mesh>
      
    </group>
  );
};

export default RoomLayout;