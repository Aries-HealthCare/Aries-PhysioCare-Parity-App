'use client';

import React, { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import * as THREE from 'three';

const SLIDES = [
  {
    icon: 'torusKnot',
    color: new THREE.Color(0x0d9488),
    emissive: new THREE.Color(0x0d9488),
    lightColor: 0x0d9488,
  },
  {
    icon: 'icosahedron',
    color: new THREE.Color(0x0284c7),
    emissive: new THREE.Color(0x0284c7),
    lightColor: 0x0284c7,
  },
  {
    icon: 'torus',
    color: new THREE.Color(0x7c3aed),
    emissive: new THREE.Color(0x7c3aed),
    lightColor: 0x7c3aed,
  },
  {
    icon: 'octahedron',
    color: new THREE.Color(0xf59e0b),
    emissive: new THREE.Color(0xf59e0b),
    lightColor: 0xf59e0b,
  },
] as const;

type SlideIndex = 0 | 1 | 2 | 3;

interface OnboardingIconProps {
  slideIndex: SlideIndex;
  size?: number;
}

export function OnboardingIcon({ slideIndex, size = 240 }: OnboardingIconProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hasWebGL, setHasWebGL] = useState(true);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || typeof window === 'undefined') return;

    let renderer: THREE.WebGLRenderer | null = null;
    let animId: number | null = null;
    let isDisposed = false;

    try {
      const testCanvas = document.createElement('canvas');
      const gl = testCanvas.getContext('webgl') || testCanvas.getContext('experimental-webgl');
      if (!gl) { setHasWebGL(false); return; }
    } catch { setHasWebGL(false); return; }

    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' });
    } catch { setHasWebGL(false); return; }
    if (!renderer) return;

    try {
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
      camera.position.set(0, 0, 4.5);
      camera.lookAt(0, 0, 0);

      renderer.setSize(size, size);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setClearColor(0x000000, 0);
      container.appendChild(renderer.domElement);

      const slide = SLIDES[slideIndex];

      // Build geometry based on slide
      let geo: THREE.BufferGeometry;
      switch (slide.icon) {
        case 'torusKnot':   geo = new THREE.TorusKnotGeometry(0.9, 0.3, 128, 20, 2, 3); break;
        case 'icosahedron': geo = new THREE.IcosahedronGeometry(1.1, 1); break;
        case 'torus':       geo = new THREE.TorusGeometry(1, 0.38, 32, 80); break;
        case 'octahedron':  geo = new THREE.OctahedronGeometry(1.2, 0); break;
        default:            geo = new THREE.IcosahedronGeometry(1.1, 1);
      }

      const mat = new THREE.MeshPhongMaterial({
        color: slide.color,
        emissive: slide.emissive,
        emissiveIntensity: 0.25,
        shininess: 90,
        transparent: true,
        opacity: 0.92,
      });

      const iconMesh = new THREE.Mesh(geo, mat);
      scene.add(iconMesh);

      // Wireframe overlay
      const wireGeo = geo.clone();
      const wireMat = new THREE.MeshBasicMaterial({
        color: slide.lightColor,
        wireframe: true,
        transparent: true,
        opacity: 0.12,
      });
      const wireMesh = new THREE.Mesh(wireGeo, wireMat);
      scene.add(wireMesh);

      // Glow particle halo
      const haloCount = 120;
      const haloGeo = new THREE.BufferGeometry();
      const haloPos = new Float32Array(haloCount * 3);
      for (let i = 0; i < haloCount; i++) {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        const r = 1.5 + Math.random() * 0.6;
        haloPos[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
        haloPos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
        haloPos[i * 3 + 2] = r * Math.cos(phi);
      }
      haloGeo.setAttribute('position', new THREE.BufferAttribute(haloPos, 3));
      const haloMat = new THREE.PointsMaterial({
        color: slide.lightColor,
        size: 0.06,
        transparent: true,
        opacity: 0.7,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      const halo = new THREE.Points(haloGeo, haloMat);
      scene.add(halo);

      // Lighting
      scene.add(new THREE.AmbientLight(0xffffff, 0.4));
      const keyLight = new THREE.PointLight(slide.lightColor, 4, 12);
      keyLight.position.set(2, 2, 3);
      scene.add(keyLight);
      const rimLight = new THREE.PointLight(0xffffff, 1.5, 10);
      rimLight.position.set(-2, -1, 2);
      scene.add(rimLight);

      const clock = new THREE.Clock();

      const animate = () => {
        if (isDisposed || !renderer) return;
        animId = requestAnimationFrame(animate);
        const t = clock.getElapsedTime();

        iconMesh.rotation.y = t * 0.6;
        iconMesh.rotation.x = Math.sin(t * 0.4) * 0.3;
        wireMesh.rotation.y = iconMesh.rotation.y;
        wireMesh.rotation.x = iconMesh.rotation.x;

        halo.rotation.y = t * 0.3;
        halo.rotation.x = t * 0.15;

        // Pulsing emissive
        (mat as THREE.MeshPhongMaterial).emissiveIntensity = 0.2 + Math.sin(t * 2) * 0.12;

        // Orbit key light
        keyLight.position.x = Math.cos(t * 0.8) * 3;
        keyLight.position.z = Math.sin(t * 0.8) * 3;

        renderer.render(scene, camera);
      };
      animate();

      return () => {
        isDisposed = true;
        if (animId !== null) cancelAnimationFrame(animId);
        try {
          if (container && renderer?.domElement && container.contains(renderer.domElement))
            container.removeChild(renderer.domElement);
          geo.dispose(); mat.dispose();
          wireGeo.dispose(); wireMat.dispose();
          haloGeo.dispose(); haloMat.dispose();
          renderer.dispose();
        } catch (_) {}
      };
    } catch (_) {
      setHasWebGL(false);
      return () => {};
    }
  }, [slideIndex, size]);

  const slide = SLIDES[slideIndex];
  const fallbackIcons = ['🔄', '💡', '📅', '👥'];
  const fallbackColors = ['#0d9488', '#0284c7', '#7c3aed', '#f59e0b'];

  if (!hasWebGL) {
    return (
      <div
        className="flex items-center justify-center rounded-full"
        style={{
          width: size, height: size,
          background: `radial-gradient(circle, ${fallbackColors[slideIndex]}30 0%, transparent 70%)`,
          boxShadow: `0 0 60px 20px ${fallbackColors[slideIndex]}40`,
          animation: 'iconPulse 3s ease-in-out infinite',
        }}
      >
        <span style={{ fontSize: size * 0.3 }}>{fallbackIcons[slideIndex]}</span>
        <style>{`
          @keyframes iconPulse {
            0%, 100% { transform: scale(1); opacity: 0.9; }
            50% { transform: scale(1.08); opacity: 1; }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      style={{
        width: size,
        height: size,
        filter: `drop-shadow(0 0 30px ${fallbackColors[slideIndex]}60)`,
      }}
    />
  );
}
