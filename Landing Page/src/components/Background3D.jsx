import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, Float, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

const GlowingShape = () => {
  const meshRef = useRef();
  const { viewport } = useThree();

  const heartGeometry = useMemo(() => {
    // Start with a sphere
    const geom = new THREE.SphereGeometry(1.5, 64, 64);
    const pos = geom.attributes.position;
    
    // Modify vertices to create a puffy 3D heart
    for (let i = 0; i < pos.count; i++) {
      let x = pos.getX(i);
      let y = pos.getY(i);
      let z = pos.getZ(i);
      
      // Heart volume deformation mapping
      // Pull up the sides to create the cleft at the top and the point at the bottom
      y = y + Math.abs(x) * 0.8;
      // Flatten it slightly so it looks more like a classic heart rather than a full ball
      z = z * 0.6;
      
      pos.setXYZ(i, x, y, z);
    }
    
    // Recalculate normals for smooth shading
    geom.computeVertexNormals();
    
    // Center the geometry so it rotates around its visual center
    geom.computeBoundingBox();
    const box = geom.boundingBox;
    const center = new THREE.Vector3();
    box.getCenter(center);
    geom.translate(-center.x, -center.y, -center.z);
    
    return geom;
  }, []);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.2;
      meshRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
      
      // Heartbeat pulse effect scale
      const pulse = 1 + Math.sin(state.clock.elapsedTime * 4) * 0.05;
      meshRef.current.scale.set(pulse, pulse, pulse);
    }
  });

  return (
    <Float floatIntensity={1.5} speed={1.5} rotationIntensity={0.2}>
      <mesh ref={meshRef} geometry={heartGeometry} position={[0, 0, 0]}>
        <MeshDistortMaterial
          color="#0011ff"
          emissive="#000044"
          emissiveIntensity={0.6}
          roughness={0.1}
          metalness={0.9}
          clearcoat={1}
          clearcoatRoughness={0.1}
          distort={0.15}
          speed={4}
          radius={1}
        />
      </mesh>
    </Float>
  );
};

const Background3D = () => {
  return (
    <div className="absolute inset-0 w-full h-full bg-[#050505] z-0">
      <Canvas 
        camera={{ position: [0, 0, 8], fov: 45 }}
        gl={{ antialias: true, alpha: false }}
        dpr={[1, 2]}
      >
        <ambientLight intensity={0.5} />
        <directionalLight 
          position={[5, 5, -5]} 
          intensity={8} 
          color="#4488ff" 
        />
        <pointLight 
          position={[-5, -5, 5]} 
          intensity={5} 
          color="#0011ff"
          distance={20}
        />
        
        <GlowingShape />
        
        {/* Environment mapping for reflections */}
        <Environment preset="night" />
        
        {/* Adding some subtle background particles or mist could be done here */}
      </Canvas>
    </div>
  );
};

export default Background3D;
