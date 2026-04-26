import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { EffectComposer, EffectPass, RenderPass, BloomEffect } from 'postprocessing'

export default function HyperspeedBackground() {
  const mountRef = useRef(null)

  useEffect(() => {
    if (!mountRef.current) return
    const mountNode = mountRef.current

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000)
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })

    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    mountNode.appendChild(renderer.domElement)

    const particlesCount = 1200
    const geometry = new THREE.BufferGeometry()
    const positions = new Float32Array(particlesCount * 3)

    for (let i = 0; i < particlesCount; i += 1) {
      positions[i * 3] = (Math.random() - 0.5) * 18
      positions[i * 3 + 1] = (Math.random() - 0.5) * 18
      positions[i * 3 + 2] = Math.random() * -120
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))

    const material = new THREE.PointsMaterial({
      color: 0xf45b8c,
      size: 0.04,
      transparent: true,
      opacity: 0.9,
    })

    const stars = new THREE.Points(geometry, material)
    scene.add(stars)

    camera.position.z = 2

    const composer = new EffectComposer(renderer)
    composer.addPass(new RenderPass(scene, camera))
    composer.addPass(new EffectPass(camera, new BloomEffect({ intensity: 0.6, luminanceThreshold: 0.1 })))

    let animationFrameId = 0

    const animate = () => {
      const positionArray = geometry.attributes.position.array

      for (let i = 0; i < particlesCount; i += 1) {
        positionArray[i * 3 + 2] += 0.75
        if (positionArray[i * 3 + 2] > 2) {
          positionArray[i * 3] = (Math.random() - 0.5) * 18
          positionArray[i * 3 + 1] = (Math.random() - 0.5) * 18
          positionArray[i * 3 + 2] = -120
        }
      }

      geometry.attributes.position.needsUpdate = true
      stars.rotation.z += 0.0007
      composer.render()
      animationFrameId = requestAnimationFrame(animate)
    }

    animate()

    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
      composer.setSize(window.innerWidth, window.innerHeight)
    }

    window.addEventListener('resize', onResize)

    return () => {
      window.removeEventListener('resize', onResize)
      cancelAnimationFrame(animationFrameId)
      renderer.dispose()
      geometry.dispose()
      material.dispose()
      if (mountNode.contains(renderer.domElement)) {
        mountNode.removeChild(renderer.domElement)
      }
    }
  }, [])

  return <div ref={mountRef} className="absolute inset-0 -z-10" />
}
