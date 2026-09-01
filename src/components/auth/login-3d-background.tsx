'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export function Login3DBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hasWebGL, setHasWebGL] = useState(true);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || typeof window === 'undefined') return;

    let renderer: THREE.WebGLRenderer | null = null;
    let animId: number | null = null;
    let isDisposed = false;

    // 1. Safe WebGL Context Detection
    try {
      const testCanvas = document.createElement('canvas');
      const gl = testCanvas.getContext('webgl') || testCanvas.getContext('experimental-webgl');
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
        antialias: true,
        powerPreference: 'high-performance',
      });
    } catch {
      setHasWebGL(false);
      return;
    }

    if (!renderer) return;

    try {
      const scene = new THREE.Scene();
      scene.fog = new THREE.FogExp2(0x030712, 0.003);

      const camera = new THREE.PerspectiveCamera(
        52,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
      );
      camera.position.set(0, -16, 58);
      camera.lookAt(0, 0, 0);

      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.35;

      container.appendChild(renderer.domElement);

      // ── 3D Iridescent Liquid Silk Surface Plane ──
      const planeWidth = 140;
      const planeHeight = 95;
      const widthSegments = 80;
      const heightSegments = 60;

      const geometry = new THREE.PlaneGeometry(
        planeWidth,
        planeHeight,
        widthSegments,
        heightSegments
      );

      const posAttr = geometry.attributes.position;
      const vertexCount = posAttr.count;

      const originalX = new Float32Array(vertexCount);
      const originalY = new Float32Array(vertexCount);
      const colors = new Float32Array(vertexCount * 3);

      const cObsidian = new THREE.Color(0x040817);
      const cAzure = new THREE.Color(0x0284c7);
      const cCyan = new THREE.Color(0x38bdf8);
      const cGold = new THREE.Color(0xf59e0b);
      const tempColor = new THREE.Color(); // Allocated ONCE, reused in loop

      for (let i = 0; i < vertexCount; i++) {
        originalX[i] = posAttr.getX(i);
        originalY[i] = posAttr.getY(i);
        colors[i * 3] = cObsidian.r;
        colors[i * 3 + 1] = cObsidian.g;
        colors[i * 3 + 2] = cObsidian.b;
      }

      geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

      // Iridescent Metallic Material
      const material = new THREE.MeshStandardMaterial({
        color: 0x060b18,
        roughness: 0.15,
        metalness: 0.88,
        side: THREE.DoubleSide,
        vertexColors: true,
        flatShading: false,
      });

      const mesh = new THREE.Mesh(geometry, material);
      mesh.rotation.x = -Math.PI / 3.1;
      mesh.position.set(0, -6, -4);
      scene.add(mesh);

      // ── Secondary Fine Wireframe Silk Lattice ──
      const wireGeo = new THREE.PlaneGeometry(planeWidth, planeHeight, 40, 30);
      const wireMat = new THREE.MeshBasicMaterial({
        color: 0x38bdf8,
        wireframe: true,
        transparent: true,
        opacity: 0.08,
      });
      const wireMesh = new THREE.Mesh(wireGeo, wireMat);
      wireMesh.rotation.x = -Math.PI / 3.1;
      wireMesh.position.set(0, -5.8, -3.8);
      scene.add(wireMesh);

      const wirePos = wireGeo.attributes.position;
      const wireCount = wirePos.count;
      const wireOrigX = new Float32Array(wireCount);
      const wireOrigY = new Float32Array(wireCount);
      for (let i = 0; i < wireCount; i++) {
        wireOrigX[i] = wirePos.getX(i);
        wireOrigY[i] = wirePos.getY(i);
      }

      // ── Floating Starlight Spores on Wave Crests ──
      const sporeCount = 260;
      const sporeGeo = new THREE.BufferGeometry();
      const sporePos = new Float32Array(sporeCount * 3);
      const sporeColors = new Float32Array(sporeCount * 3);

      for (let i = 0; i < sporeCount; i++) {
        sporePos[i * 3] = (Math.random() - 0.5) * 110;
        sporePos[i * 3 + 1] = (Math.random() - 0.5) * 80;
        sporePos[i * 3 + 2] = (Math.random() - 0.5) * 25 + 5;

        const isGold = Math.random() > 0.65;
        const col = isGold ? cGold : cCyan;
        sporeColors[i * 3] = col.r;
        sporeColors[i * 3 + 1] = col.g;
        sporeColors[i * 3 + 2] = col.b;
      }

      sporeGeo.setAttribute('position', new THREE.BufferAttribute(sporePos, 3));
      sporeGeo.setAttribute('color', new THREE.BufferAttribute(sporeColors, 3));

      let sporeTex: THREE.CanvasTexture | null = null;
      try {
        const c = document.createElement('canvas');
        c.width = 32;
        c.height = 32;
        const ctx = c.getContext('2d');
        if (ctx) {
          const grad = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
          grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
          grad.addColorStop(0.35, 'rgba(56, 189, 248, 0.8)');
          grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, 32, 32);
          sporeTex = new THREE.CanvasTexture(c);
        }
      } catch (_) {}

      const sporeMat = new THREE.PointsMaterial({
        size: 2.2,
        map: sporeTex || undefined,
        vertexColors: true,
        transparent: true,
        opacity: 0.85,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });

      const spores = new THREE.Points(sporeGeo, sporeMat);
      scene.add(spores);

      // ── Studio Dynamic Specular Lighting ──
      const ambientLight = new THREE.AmbientLight(0x0f172a, 2.5);
      scene.add(ambientLight);

      const cyanLight = new THREE.PointLight(0x0284c7, 65, 120, 1.2);
      cyanLight.position.set(-20, 10, 25);
      scene.add(cyanLight);

      const goldLight = new THREE.PointLight(0xf59e0b, 50, 100, 1.2);
      goldLight.position.set(25, -10, 20);
      scene.add(goldLight);

      const topLight = new THREE.DirectionalLight(0x6366f1, 1.8);
      topLight.position.set(0, 25, 15);
      scene.add(topLight);

      // ── Mouse Tracking (Pure JS, no React re-renders) ──
      let mouseX = 0;
      let mouseY = 0;
      let targetMouseX = 0;
      let targetMouseY = 0;
      let rippleIntensity = 0;

      const onMouseMove = (e: MouseEvent) => {
        const halfW = window.innerWidth / 2;
        const halfH = window.innerHeight / 2;
        targetMouseX = (e.clientX - halfW) / halfW;
        targetMouseY = (e.clientY - halfH) / halfH;
        rippleIntensity = 1.0;
      };

      window.addEventListener('mousemove', onMouseMove, { passive: true });

      const onResize = () => {
        if (!container || !renderer) return;
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      };

      window.addEventListener('resize', onResize);

      // ── 60FPS Fluid Wave Animation Loop ──
      const clock = new THREE.Clock();

      const animate = () => {
        if (isDisposed || !renderer) return;
        animId = requestAnimationFrame(animate);

        const elapsedTime = clock.getElapsedTime();

        mouseX += (targetMouseX - mouseX) * 0.05;
        mouseY += (targetMouseY - mouseY) * 0.05;
        rippleIntensity *= 0.97;

        cyanLight.position.x = mouseX * 35 - 15;
        cyanLight.position.y = -mouseY * 20 + 10;

        goldLight.position.x = -mouseX * 30 + 20;
        goldLight.position.y = mouseY * 18 - 8;

        camera.position.x = mouseX * 5;
        camera.position.y = -16 + mouseY * 3.5;
        camera.lookAt(0, 0, 0);

        // ── Liquid Wave Displacement ──
        const p = geometry.attributes.position;
        const c = geometry.attributes.color;

        for (let i = 0; i < vertexCount; i++) {
          const x = originalX[i];
          const y = originalY[i];

          const w1 = Math.sin(x * 0.08 + elapsedTime * 1.3) * 3.2;
          const w2 = Math.cos(y * 0.09 + elapsedTime * 1.0) * 2.6;
          const w3 = Math.sin((x + y) * 0.05 + elapsedTime * 1.6) * 1.8;

          const dx = x - mouseX * 35;
          const dy = y - (-mouseY * 25);
          const dist = Math.sqrt(dx * dx + dy * dy);
          const mWave = Math.sin(dist * 0.22 - elapsedTime * 3.5) * Math.exp(-dist * 0.06) * 3.5 * rippleIntensity;

          const totalZ = w1 + w2 + w3 + mWave;
          p.setZ(i, totalZ);

          const norm = Math.max(0, Math.min(1, (totalZ + 6) / 14));
          if (norm < 0.5) {
            tempColor.lerpColors(cObsidian, cAzure, norm * 2);
          } else {
            tempColor.lerpColors(cAzure, cGold, (norm - 0.5) * 2);
          }

          c.setXYZ(i, tempColor.r, tempColor.g, tempColor.b);
        }

        p.needsUpdate = true;
        c.needsUpdate = true;

        // Wireframe mesh update
        const wp = wireGeo.attributes.position;
        for (let i = 0; i < wireCount; i++) {
          const wx = wireOrigX[i];
          const wy = wireOrigY[i];
          const wz =
            Math.sin(wx * 0.08 + elapsedTime * 1.3) * 3.2 +
            Math.cos(wy * 0.09 + elapsedTime * 1.0) * 2.6;
          wp.setZ(i, wz);
        }
        wp.needsUpdate = true;

        // Spores rotation
        spores.rotation.y = elapsedTime * 0.025;
        spores.rotation.x = Math.sin(elapsedTime * 0.02) * 0.04;

        renderer.render(scene, camera);
      };

      animate();

      return () => {
        isDisposed = true;
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('resize', onResize);
        if (animId !== null) {
          cancelAnimationFrame(animId);
        }

        try {
          if (container && renderer && renderer.domElement && container.contains(renderer.domElement)) {
            container.removeChild(renderer.domElement);
          }
          geometry.dispose();
          material.dispose();
          wireGeo.dispose();
          wireMat.dispose();
          sporeGeo.dispose();
          sporeMat.dispose();
          if (sporeTex) sporeTex.dispose();
          renderer.dispose();
        } catch (_) {}
      };
    } catch (_) {
      setHasWebGL(false);
      return () => {};
    }
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#030712]"
      aria-hidden="true"
    >
      {/* Iridescent radial ambient lighting */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_75%_50%_at_50%_-10%,rgba(2,132,199,0.22),transparent_70%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_65%_50%_at_50%_110%,rgba(245,158,11,0.14),transparent_70%)] pointer-events-none" />

      {/* Fallback CSS Wave Glows */}
      {!hasWebGL && (
        <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_50%_60%,rgba(2,132,199,0.3)_0%,transparent_60%)] pointer-events-none animate-pulse" />
      )}
    </div>
  );
}
