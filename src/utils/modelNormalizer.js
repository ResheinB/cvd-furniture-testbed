// frontend/src/utils/modelNormalizer.js
import * as THREE from 'three';

/**
 * Normalizes a 3D model to a consistent size
 * @param {THREE.Object3D} model - The loaded 3D model
 * @param {number} targetSize - Target bounding box size (default: 2)
 * @returns {THREE.Object3D} - Normalized model
 */
export const normalizeModelSize = (model, targetSize = 2) => {
  const box = new THREE.Box3().setFromObject(model);
  const size = box.getSize(new THREE.Vector3());
  
  // Find the largest dimension
  const maxDimension = Math.max(size.x, size.y, size.z);
  
  // Calculate scale factor
  const scaleFactor = targetSize / maxDimension;
  
  // Apply scale
  model.scale.setScalar(scaleFactor);
  
  // Center the model
  const center = box.getCenter(new THREE.Vector3());
  model.position.sub(center.multiplyScalar(scaleFactor));
  
  console.log(`Normalized model: Original size ${maxDimension.toFixed(2)}, Scale factor: ${scaleFactor.toFixed(3)}`);
  
  return model;
};

export const getModelSize = (model) => {
  const box = new THREE.Box3().setFromObject(model);
  const size = box.getSize(new THREE.Vector3());
  return {
    width: size.x,
    height: size.y,
    depth: size.z,
    max: Math.max(size.x, size.y, size.z)
  };
};