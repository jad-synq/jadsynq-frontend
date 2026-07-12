'use client'

import { useEffect, useRef } from 'react'
import * as THREE from 'three'

// Note: this deliberately uses plain Three.js rather than
// @react-three/fiber/@react-three/drei. R3F's custom React renderer
// (react-reconciler) reaches into React's internal
// __SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED object, and that
// combination currently crashes under Next.js 15's App Router bundling
// even with matching React 18 versions and `transpilePackages` set --
// a confirmed, still-open upstream issue affecting other projects with
// this exact stack (react-three-fiber v8 + Next.js 15), not something
// fixable from this app's config. Verified via a real headless-browser
// render before committing to this rewrite: R3F crashed with
// "Cannot read properties of undefined (reading 'ReactCurrentBatchConfig')"
// and the canvas never mounted; plain Three.js has no such dependency on
// React's internals and renders correctly.

// Kept small and confined to the upper corners so the shapes read as a
// subtle accent around the headline rather than overlapping the search
// bar / popular-searches area below it (verified visually via a headless
// screenshot -- the original larger/lower-positioned shapes drifted into
// that interactive area and looked cluttered even though pointer-events
// are disabled).
const SHAPES: Array<{
  position: [number, number, number]
  color: number
  geometry: 'icosahedron' | 'torus' | 'octahedron'
  scale: number
  speed: number
}> = [
  { position: [-4, 2.2, -3], color: 0x0e7c4a, geometry: 'icosahedron', scale: 0.5, speed: 1.1 },
  { position: [4.2, 1.8, -3], color: 0xe8a73b, geometry: 'torus', scale: 0.45, speed: 0.9 },
  { position: [-4.4, 0.4, -2.5], color: 0x8fbfa3, geometry: 'octahedron', scale: 0.35, speed: 1.4 },
  { position: [4.6, -0.4, -3.5], color: 0x0a5c37, geometry: 'icosahedron', scale: 0.3, speed: 1.2 },
]

function makeGeometry(kind: (typeof SHAPES)[number]['geometry']): THREE.BufferGeometry {
  switch (kind) {
    case 'icosahedron': return new THREE.IcosahedronGeometry(1, 0)
    case 'torus': return new THREE.TorusGeometry(0.8, 0.3, 16, 32)
    case 'octahedron': return new THREE.OctahedronGeometry(1, 0)
  }
}

/** Purely decorative background scene for the homepage hero -- no
 * interaction, no text/labels. Parent is responsible for gating this on
 * prefers-reduced-motion and viewport size (see src/app/page.tsx) since
 * those are presentational decisions, not scene concerns. */
export default function HeroScene() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 100)
    camera.position.set(0, 0, 6)

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(container.clientWidth, container.clientHeight)
    container.appendChild(renderer.domElement)

    scene.add(new THREE.AmbientLight(0xffffff, 0.7))
    const keyLight = new THREE.DirectionalLight(0xffffff, 0.9)
    keyLight.position.set(4, 4, 4)
    scene.add(keyLight)
    const fillLight = new THREE.DirectionalLight(0xffffff, 0.3)
    fillLight.position.set(-3, -2, 2)
    scene.add(fillLight)

    const meshes = SHAPES.map(shape => {
      const geometry = makeGeometry(shape.geometry)
      const material = new THREE.MeshStandardMaterial({ color: shape.color, roughness: 0.35, metalness: 0.1 })
      const mesh = new THREE.Mesh(geometry, material)
      mesh.position.set(...shape.position)
      mesh.scale.setScalar(shape.scale)
      return { mesh, geometry, material, speed: shape.speed, baseY: shape.position[1] }
    })
    meshes.forEach(({ mesh }) => scene.add(mesh))

    let frameId = 0
    const clock = new THREE.Clock()

    function animate() {
      const t = clock.getElapsedTime()
      for (const { mesh, speed, baseY } of meshes) {
        mesh.rotation.x = t * 0.2 * speed
        mesh.rotation.y = t * 0.3 * speed
        mesh.position.y = baseY + Math.sin(t * speed) * 0.3
      }
      renderer.render(scene, camera)
      frameId = requestAnimationFrame(animate)
    }
    animate()

    const handleResize = () => {
      if (!container) return
      camera.aspect = container.clientWidth / container.clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(container.clientWidth, container.clientHeight)
    }
    window.addEventListener('resize', handleResize)

    return () => {
      cancelAnimationFrame(frameId)
      window.removeEventListener('resize', handleResize)
      meshes.forEach(({ geometry, material }) => {
        geometry.dispose()
        material.dispose()
      })
      renderer.dispose()
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement)
      }
    }
  }, [])

  return <div ref={containerRef} style={{ width: '100%', height: '100%', pointerEvents: 'none' }} />
}
