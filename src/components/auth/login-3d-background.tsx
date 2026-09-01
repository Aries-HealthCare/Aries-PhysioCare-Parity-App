'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export function Login3DBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [webglReady, setWebglReady] = useState(false);

  useEffect(() => {
    // Check if mobile (< 768px) -> Keep pure CSS aurora for maximum speed & 120fps
    if (typeof window === 'undefined' || window.innerWidth < 768) {
      return;
    }

    const container = containerRef.current;
    if (!container) return;

    let renderer: THREE.WebGLRenderer | null = null;
    let animId: number | null = null;
    let isDisposed = false;
    let lastFrame = 0;
    const FPS_CAP = 1000 / 50; // ~50fps smooth cap to save battery

    // Initialize WebGL in next idle cycle so initial paint is 0ms latency
    const initTimer = setTimeout(() => {
      if (isDisposed) return;

      try {
        const tc = document.createElement('canvas');
        const gl = tc.getContext('webgl') || tc.getContext('experimental-webgl');
        if (!gl) return;
      } catch { return; }

      try {
        renderer = new THREE.WebGLRenderer({
          alpha: true,
          antialias: false,
          powerPreference: 'low-power',
        });
      } catch { return; }

      if (!renderer || isDisposed) return;

      try {
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.set(0, 0, 4);

        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
        renderer.setClearColor(0x000000, 0);
        container.appendChild(renderer.domElement);

        // ── Aurora wave mesh ─────────────────────────────────────────────────
        const wGeo = new THREE.PlaneGeometry(20, 10, 70, 35);
        const wMat = new THREE.ShaderMaterial({
          transparent: true,
          wireframe: false,
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
              float mx = (uMouse.x - 0.5) * 0.8;
              float my = (uMouse.y - 0.5) * 0.5;

              pos.z  = wave(pos.xy, 0.6, 0.35, 1.1);
              pos.z += wave(pos.xy + vec2(mx, my), 0.4, 0.25, 2.2);
              pos.z += wave(pos.xy * 1.5, 0.9, 0.15, 3.5);
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
              vec3 violet  = vec3(0.48, 0.13, 0.85);
              vec3 emerald = vec3(0.04, 0.60, 0.35);
              vec3 amber   = vec3(0.90, 0.45, 0.05);

              float t = uTime * 0.18;
              float band = sin(vUv.x * 3.14159 + t) * 0.5 + 0.5;
              float hue  = sin(vUv.y * 2.0 + t * 0.5) * 0.5 + 0.5;

              vec3 col = mix(teal, violet, band);
              col = mix(col, emerald, hue * 0.45);
              col = mix(col, amber,   max(0.0, vElev * 0.4));

              float alpha = 0.18 + vElev * 0.12 + 0.08 * sin(vUv.x * 6.0 + uTime);
              alpha = clamp(alpha, 0.0, 0.55);
              gl_FragColor = vec4(col, alpha);
            }
          `,
        });
        const wave = new THREE.Mesh(wGeo, wMat);
        wave.rotation.x = -0.45;
        wave.position.y = -1.2;
        scene.add(wave);

        // ── Aurora particle orbs ─────────────────────────────────────────────
        const ORB_COUNT = 240;
        const orbGeo = new THREE.BufferGeometry();
        const positions = new Float32Array(ORB_COUNT * 3);
        const colors = new Float32Array(ORB_COUNT * 3);
        const sizes = new Float32Array(ORB_COUNT);

        const orbPalette = [
          new THREE.Color(0x0d9488),
          new THREE.Color(0x7c3aed),
          new THREE.Color(0x059669),
          new THREE.Color(0xf59e0b),
          new THREE.Color(0x0284c7),
        ];

        for (let i = 0; i < ORB_COUNT; i++) {
          positions[i * 3] = (Math.random() - 0.5) * 24;
          positions[i * 3 + 1] = (Math.random() - 0.5) * 12;
          positions[i * 3 + 2] = (Math.random() - 0.5) * 8;
          const c = orbPalette[Math.floor(Math.random() * orbPalette.length)];
          colors[i * 3] = c.r;
          colors[i * 3 + 1] = c.g;
          colors[i * 3 + 2] = c.b;
          sizes[i] = 0.4 + Math.random() * 2.0;
        }

        orbGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        orbGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        orbGeo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

        const orbMat = new THREE.ShaderMaterial({
          transparent: true,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
          vertexColors: true,
          uniforms: { uTime: { value: 0 } },
          vertexShader: `
            attribute float size;
            uniform   float uTime;
            varying   vec3  vColor;
            void main() {
              vColor = color;
              vec3 p = position;
              p.x += sin(uTime * 0.3 + position.y * 0.7) * 0.3;
              p.y += cos(uTime * 0.25 + position.x * 0.5) * 0.25;
              gl_Position  = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
              gl_PointSize = size * (400.0 / -gl_Position.z);
            }
          `,
          fragmentShader: `
            varying vec3 vColor;
            void main() {
              float d = length(gl_PointCoord - vec2(0.5));
              if (d > 0.5) discard;
              float alpha = smoothstep(0.5, 0.0, d) * 0.72;
              gl_FragColor = vec4(vColor, alpha);
            }
          `,
        });
        const orbs = new THREE.Points(orbGeo, orbMat);
        scene.add(orbs);

        // ── Mouse tracking ────────────────────────────────────────────────────
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

          mouseX += (targetX - mouseX) * 0.05;
          mouseY += (targetY - mouseY) * 0.05;

          wMat.uniforms.uTime.value = t;
          wMat.uniforms.uMouse.value.set(mouseX + 0.5, mouseY + 0.5);
          orbMat.uniforms.uTime.value = t;

          camera.position.x += (-mouseX * 0.5 - camera.position.x) * 0.04;
          camera.position.y += (mouseY * 0.35 - camera.position.y) * 0.04;
          camera.lookAt(0, 0, 0);

          orbs.rotation.y = t * 0.015;

          renderer.render(scene, camera);
        };
        requestAnimationFrame(animate);
        setWebglReady(true);

        return () => {
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
        return () => {};
      }
    }, 50);

    return () => {
      isDisposed = true;
      clearTimeout(initTimer);
    };
  }, []);

  return (
    <div
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
      style={{ background: '#030712' }}
      aria-hidden="true"
    >
      {/* ── Base CSS Aurora Layer (Always Instant at 0ms) ── */}
      <div
        className="absolute pointer-events-none rounded-full"
        style={{
          width: '110vw',
          height: '110vw',
          top: '-25%',
          left: '-30%',
          background: 'radial-gradient(circle, rgba(13,148,136,0.32) 0%, transparent 65%)',
          filter: 'blur(80px)',
          animation: 'auroraBlob1 18s ease-in-out infinite alternate',
          willChange: 'transform',
        }}
      />
      <div
        className="absolute pointer-events-none rounded-full"
        style={{
          width: '90vw',
          height: '90vw',
          top: '20%',
          right: '-25%',
          background: 'radial-gradient(circle, rgba(124,58,237,0.28) 0%, transparent 65%)',
          filter: 'blur(90px)',
          animation: 'auroraBlob2 24s ease-in-out infinite alternate',
          willChange: 'transform',
        }}
      />
      <div
        className="absolute pointer-events-none rounded-full"
        style={{
          width: '75vw',
          height: '75vw',
          bottom: '-15%',
          left: '10%',
          background: 'radial-gradient(circle, rgba(5,150,105,0.24) 0%, transparent 65%)',
          filter: 'blur(70px)',
          animation: 'auroraBlob3 30s ease-in-out infinite alternate',
          willChange: 'transform',
        }}
      />
      <div
        className="absolute pointer-events-none rounded-full"
        style={{
          width: '60vw',
          height: '60vw',
          bottom: '25%',
          right: '5%',
          background: 'radial-gradient(circle, rgba(245,158,11,0.16) 0%, transparent 65%)',
          filter: 'blur(80px)',
          animation: 'auroraBlob4 22s ease-in-out infinite alternate',
          willChange: 'transform',
        }}
      />

      {/* Floating micro-particles */}
      {Array.from({ length: 16 }).map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full pointer-events-none"
          style={{
            width: 3 + (i % 3),
            height: 3 + (i % 3),
            left: `${(i * 6.3) % 100}%`,
            top: `${(i * 5.7 + 10) % 100}%`,
            background: ['#0d9488', '#7c3aed', '#059669', '#f59e0b'][i % 4],
            opacity: 0.45 + (i % 3) * 0.1,
            filter: 'blur(1px)',
            animation: `float${(i % 4) + 1} ${6 + (i % 5)}s ease-in-out ${i * 0.4}s infinite`,
          }}
        />
      ))}

      {/* Progressive 3D WebGL Canvas Overlay */}
      <div
        ref={containerRef}
        className={`absolute inset-0 transition-opacity duration-1000 ${
          webglReady ? 'opacity-100' : 'opacity-0'
        }`}
      />

      <style>{`
        @keyframes auroraBlob1 {
          0%   { transform: translate(0,0) scale(1) rotate(0deg); }
          50%  { transform: translate(8vw,-6vh) scale(1.18) rotate(8deg); }
          100% { transform: translate(-5vw,9vh) scale(0.9) rotate(-5deg); }
        }
        @keyframes auroraBlob2 {
          0%   { transform: translate(0,0) scale(1); }
          50%  { transform: translate(-9vw,7vh) scale(1.12); }
          100% { transform: translate(6vw,-8vh) scale(1.06); }
        }
        @keyframes auroraBlob3 {
          0%   { transform: translate(0,0) scale(1); }
          50%  { transform: translate(5vw,-9vh) scale(1.22); }
          100% { transform: translate(-7vw,5vh) scale(0.88); }
        }
        @keyframes auroraBlob4 {
          0%   { transform: translate(0,0) scale(1); }
          50%  { transform: translate(-6vw,-5vh) scale(1.15); }
          100% { transform: translate(8vw,7vh) scale(0.95); }
        }
        @keyframes float1 {
          0%, 100% { transform: translateY(0) translateX(0); }
          50%      { transform: translateY(-18px) translateX(8px); }
        }
        @keyframes float2 {
          0%, 100% { transform: translateY(0) translateX(0); }
          50%      { transform: translateY(14px) translateX(-10px); }
        }
        @keyframes float3 {
          0%, 100% { transform: translateY(0) translateX(0); }
          50%      { transform: translateY(-22px) translateX(-6px); }
        }
        @keyframes float4 {
          0%, 100% { transform: translateY(0) translateX(0); }
          50%      { transform: translateY(16px) translateX(12px); }
        }
      `}</style>
    </div>
  );
}
