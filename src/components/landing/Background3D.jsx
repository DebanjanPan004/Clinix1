import { useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Environment, Float, MeshDistortMaterial } from '@react-three/drei'
import * as THREE from 'three'

function GlowingHeart() {
  const meshRef = useRef(null)

  const heartGeometry = useMemo(() => {
    const geometry = new THREE.SphereGeometry(1.45, 64, 64)
    const positions = geometry.attributes.position

    for (let i = 0; i < positions.count; i += 1) {
      const x = positions.getX(i)
      let y = positions.getY(i)
      const z = positions.getZ(i)

      y += Math.abs(x) * 0.78
      positions.setXYZ(i, x, y, z * 0.62)
    }

    geometry.computeVertexNormals()
    geometry.computeBoundingBox()

    const center = new THREE.Vector3()
    geometry.boundingBox.getCenter(center)
    geometry.translate(-center.x, -center.y, -center.z)
    return geometry
  }, [])

  useFrame((state) => {
    if (!meshRef.current) return

    meshRef.current.rotation.y = state.clock.elapsedTime * 0.24
    meshRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.52) * 0.1

    const pulse = 1 + Math.sin(state.clock.elapsedTime * 3.8) * 0.055
    meshRef.current.scale.set(pulse, pulse, pulse)
  })

  return (
    <Float floatIntensity={1.6} speed={1.55} rotationIntensity={0.2}>
      <mesh ref={meshRef} geometry={heartGeometry} position={[0, 0, 0]}>
        <MeshDistortMaterial
          color="#FF7FA5"
          emissive="#F45B8C"
          emissiveIntensity={1}
          roughness={0.12}
          metalness={0.86}
          clearcoat={1}
          clearcoatRoughness={0.12}
          distort={0.13}
          speed={3.8}
          radius={1}
        />
      </mesh>
    </Float>
  )
}

export default function Background3D() {
  return (
    <div className="absolute inset-0 z-0 h-full w-full bg-black">
      <Canvas camera={{ position: [0, 0, 7.6], fov: 43 }} gl={{ antialias: true, alpha: true }} dpr={[1, 2]}>
        <ambientLight intensity={0.36} />
        <directionalLight position={[4.5, 4, -4]} intensity={4.8} color="#FF9CBA" />
        <pointLight position={[-4, -3, 4]} intensity={4.5} color="#F45B8C" distance={19} />
        <pointLight position={[0, 2, 3]} intensity={1.9} color="#ffffff" distance={10} />
        <GlowingHeart />
        <Environment preset="city" />
      </Canvas>
    </div>
  )
}