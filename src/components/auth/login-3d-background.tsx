'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export function Login3DBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hasWebGL, setHasWebGL] = useState<boolean | null>(null);

  useEffect(() => {
    // Check if mobile (< 768px) -> Use high-performance CSS gradient
    if (typeof window === 'undefined' || window.innerWidth < 768) {
      setHasWebGL(false);
      return;
    }

    const container = containerRef.current;
    if (!container) return;

    let renderer: THREE.WebGLRenderer | null = null;
    let animId: number | null = null;
    let isDisposed = false;
    let lastFrame = 0;
    const FPS_CAP = 1000 / 50;

    try {
      const tc = document.createElement('canvas');
      const gl = tc.getContext('webgl') || tc.getContext('experimental-webgl');
      if (!gl) {
        setHasWebGL(false);
        return;
      }
    } catch {
      setHasWebGL(false);
      return;
    }

    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: false,
        powerPreference: 'low-power',
      });
    } catch {
      setHasWebGL(false);
      return;
    }

    if (!renderer) {
      setHasWebGL(false);
      return;
    }

    try {
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
      camera.position.set(0, 0, 4);

      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
      renderer.setClearColor(0x030712, 1);
      container.appendChild(renderer.domElement);
      setHasWebGL(true);

      // ── Single Unified Aurora Fluid Wave ─────────────────────────────────
      const wGeo = new THREE.PlaneGeometry(18, 9, 64, 32);
      const wMat = new THREE.ShaderMaterial({
        transparent: true,
        side: THREE.DoubleSide,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: {
          uTime: { value: 0 },
          uMouse: { value: new THREE.Vector2(0.5, 0.5) },
        },
        vertexShader: `
          uniform float uTime;
          uniform vec2  uMouse;
          varying vec2  vUv;
          varying float vElev;

          float wave(vec2 p, float spd, float amp, float freq) {
            return sin(p.x * freq + uTime * spd) * cos(p.y * freq * 0.5 + uTime * spd * 0.7) * amp;
          }

          void main() {
            vUv = uv;
            vec3 pos = position;
            float mx = (uMouse.x - 0.5) * 0.6;
            float my = (uMouse.y - 0.5) * 0.4;

            pos.z  = wave(pos.xy, 0.5, 0.3, 1.0);
            pos.z += wave(pos.xy + vec2(mx, my), 0.35, 0.2, 2.0);
            vElev  = pos.z;

            gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
          }
        `,
        fragmentShader: `
          uniform float uTime;
          varying vec2  vUv;
          varying float vElev;

          void main() {
            vec3 teal    = vec3(0.05, 0.58, 0.53);
            vec3 emerald = vec3(0.04, 0.60, 0.35);
            vec3 cyan    = vec3(0.02, 0.45, 0.65);

            float t = uTime * 0.15;
            float band = sin(vUv.x * 3.14159 + t) * 0.5 + 0.5;

            vec3 col = mix(teal, emerald, band);
            col = mix(col, cyan, max(0.0, vElev * 0.5));

            float alpha = 0.14 + vElev * 0.1;
            alpha = clamp(alpha, 0.0, 0.4);
            gl_FragColor = vec4(col, alpha);
          }
        `,
      });
      const wave = new THREE.Mesh(wGeo, wMat);
      wave.rotation.x = -0.4;
      wave.position.y = -1.0;
      scene.add(wave);

      // ── Ambient Floating Particles ───────────────────────────────────────
      const ORB_COUNT = 120;
      const orbGeo = new THREE.BufferGeometry();
      const positions = new Float32Array(ORB_COUNT * 3);
      const colors = new Float32Array(ORB_COUNT * 3);

      const tealCol = new THREE.Color(0x0d9488);
      const emeraldCol = new THREE.Color(0x059669);

      for (let i = 0; i < ORB_COUNT; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 20;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 6;
        const c = i % 2 === 0 ? tealCol : emeraldCol;
        colors[i * 3] = c.r;
        colors[i * 3 + 1] = c.g;
        colors[i * 3 + 2] = c.b;
      }

      orbGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      orbGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

      const orbMat = new THREE.PointsMaterial({
        size: 0.06,
        transparent: true,
        opacity: 0.55,
        vertexColors: true,
        blending: THREE.AdditiveBlending,
      });
      const orbs = new THREE.Points(orbGeo, orbMat);
      scene.add(orbs);

      // ── Mouse tracking ──────────────────────────────────────────────────
      let targetX = 0, targetY = 0;
      let mouseX = 0, mouseY = 0;

      const onMouseMove = (e: MouseEvent) => {
        targetX = (e.clientX / window.innerWidth - 0.5);
        targetY = (e.clientY / window.innerHeight - 0.5);
      };
      window.addEventListener('mousemove', onMouseMove, { passive: true });

      const onResize = () => {
        if (!renderer) return;
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      };
      window.addEventListener('resize', onResize);

      const clock = new THREE.Clock();

      const animate = (now: number) => {
        if (isDisposed || !renderer) return;
        animId = requestAnimationFrame(animate);
        if (now - lastFrame < FPS_CAP) return;
        lastFrame = now;

        const t = clock.getElapsedTime();

        mouseX += (targetX - mouseX) * 0.04;
        mouseY += (targetY - mouseY) * 0.04;

        wMat.uniforms.uTime.value = t;
        wMat.uniforms.uMouse.value.set(mouseX + 0.5, mouseY + 0.5);

        camera.position.x += (-mouseX * 0.4 - camera.position.x) * 0.03;
        camera.position.y += (mouseY * 0.3 - camera.position.y) * 0.03;
        camera.lookAt(0, 0, 0);

        orbs.rotation.y = t * 0.01;

        renderer.render(scene, camera);
      };
      requestAnimationFrame(animate);

      return () => {
        isDisposed = true;
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('resize', onResize);
        if (animId !== null) cancelAnimationFrame(animId);
        try {
          if (container && renderer?.domElement && container.contains(renderer.domElement)) {
            container.removeChild(renderer.domElement);
          }
          wGeo.dispose();
          wMat.dispose();
          orbGeo.dispose();
          orbMat.dispose();
          renderer?.dispose();
        } catch (_) {}
      };
    } catch (_) {
      setHasWebGL(false);
      return () => {};
    }
  }, []);

  return (
    <div
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#030712]"
      aria-hidden="true"
    >
      {/* ── WebGL 3D Scene (Desktop) ── */}
      <div ref={containerRef} className="absolute inset-0" />

      {/* ── Clean CSS Aurora Fallback (Mobile / Non-WebGL) ── */}
      {hasWebGL === false && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className="absolute rounded-full"
            style={{
              width: '90vw',
              height: '90vw',
              top: '-15%',
              left: '-20%',
              background: 'radial-gradient(circle, rgba(13,148,136,0.25) 0%, transparent 65%)',
              filter: 'blur(70px)',
              animation: 'cleanAurora1 16s ease-in-out infinite alternate',
            }}
          />
          <div
            className="absolute rounded-full"
            style={{
              width: '75vw',
              height: '75vw',
              bottom: '-10%',
              right: '-15%',
              background: 'radial-gradient(circle, rgba(5,150,105,0.2) 0%, transparent 65%)',
              filter: 'blur(70px)',
              animation: 'cleanAurora2 20s ease-in-out infinite alternate',
            }}
          />
        </div>
      )}

      {/* Subtle Grid Accent for Clinical Elegance */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255,255,255,0.2) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,0.2) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
        }}
      />

      <style>{`
        @keyframes cleanAurora1 {
          0%   { transform: translate(0, 0) scale(1); }
          50%  { transform: translate(5vw, -4vh) scale(1.1); }
          100% { transform: translate(-3vw, 5vh) scale(0.95); }
        }
        @keyframes cleanAurora2 {
          0%   { transform: translate(0, 0) scale(1); }
          50%  { transform: translate(-5vw, 4vh) scale(1.08); }
          100% { transform: translate(4vw, -4vh) scale(0.96); }
        }
      `}</style>
    </div>
  );
}
