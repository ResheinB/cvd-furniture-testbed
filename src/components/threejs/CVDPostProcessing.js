import React, { useEffect, useRef } from 'react';
import { useThree, extend } from '@react-three/fiber';
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass';

// Extend Three.js for React Three Fiber
extend({ EffectComposer, RenderPass, ShaderPass });

const CVDPostProcessing = ({ filterType = 'none', filterMatrix }) => {
  const { gl, scene, camera, size } = useThree();
  const composer = useRef();
  const cvdPass = useRef();
  
  // Create CVD shader with scientific color transformation
  const createCVDShader = (matrix) => {
    return {
      uniforms: {
        tDiffuse: { value: null },
        cvdMatrix: { value: matrix },
        severity: { value: 1.0 }
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D tDiffuse;
        uniform mat4 cvdMatrix;
        uniform float severity;
        varying vec2 vUv;
        
        // Convert RGB to LMS (cone response space)
        mat3 rgbToLms = mat3(
          17.8824, 43.5161, 4.1193,
          3.4557, 27.1554, 3.8671,
          0.02996, 0.18431, 1.4671
        );
        
        // Convert LMS to RGB
        mat3 lmsToRgb = mat3(
          0.0809, -0.1305, 0.1167,
          -0.0102, 0.0540, -0.1136,
          -0.0004, -0.0041, 0.6935
        );
        
        void main() {
          vec4 original = texture2D(tDiffuse, vUv);
          
          if (severity < 0.001) {
            gl_FragColor = original;
            return;
          }
          
          vec3 rgb = original.rgb;
          
          // Apply CVD matrix transformation (Brettel, Viénot & Mollon, 1997)
          vec4 colorVec = vec4(rgb, 1.0);
          vec3 transformed = (cvdMatrix * colorVec).rgb;
          
          // Blend between original and transformed based on severity
          vec3 finalColor = mix(rgb, transformed, severity);
          
          // Preserve alpha channel
          gl_FragColor = vec4(finalColor, original.a);
        }
      `
    };
  };
  
  useEffect(() => {
    if (filterType === 'none') {
      // Clean up if exists
      if (composer.current) {
        composer.current.dispose();
        composer.current = null;
      }
      return;
    }
    
    try {
      // Create effect composer
      const newComposer = new EffectComposer(gl);
      
      // Create render pass
      const renderPass = new RenderPass(scene, camera);
      newComposer.addPass(renderPass);
      
      // Create CVD shader pass
      const cvdShader = createCVDShader(filterMatrix);
      const newCVDPass = new ShaderPass(cvdShader);
      newComposer.addPass(newCVDPass);
      cvdPass.current = newCVDPass;
      
      composer.current = newComposer;
      
      // Set initial size
      newComposer.setSize(size.width, size.height);
      newComposer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      
    } catch (error) {
      console.error('Error creating CVD post-processing:', error);
    }
    
    return () => {
      if (composer.current) {
        composer.current.dispose();
      }
    };
  }, [filterType, gl, scene, camera]);
  
  useEffect(() => {
    if (cvdPass.current && filterMatrix) {
      // Update the CVD matrix uniform
      cvdPass.current.uniforms.cvdMatrix.value = filterMatrix;
    }
  }, [filterMatrix]);
  
  useEffect(() => {
    if (composer.current) {
      composer.current.setSize(size.width, size.height);
      composer.current.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    }
  }, [size]);
  
  useEffect(() => {
    if (!composer.current || filterType === 'none') return;
    
    let frameId;
    
    const render = () => {
      if (composer.current) {
        composer.current.render();
      }
      frameId = requestAnimationFrame(render);
    };
    
    render();
    
    return () => {
      if (frameId) {
        cancelAnimationFrame(frameId);
      }
    };
  }, [filterType]);
  
  return null;
};

export default CVDPostProcessing;