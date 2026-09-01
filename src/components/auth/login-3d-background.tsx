'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export function Login3DBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const container = containerRef.current;
    if (!container) return;

    let renderer: THREE.WebGLRenderer | null = null;
    let animationFrameId: number | null = null;
    let isDisposed = false;

    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance',
      });
    } catch {
      return;
    }

    if (!renderer) return;

    try {
      const scene = new THREE.Scene();
      scene.fog = new THREE.FogExp2(0x030712, 0.0035);

      const camera = new THREE.PerspectiveCamera(
        55,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
      );
      camera.position.set(0, -18, 55);
      camera.lookAt(0, 0, 0);

      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.3;

      container.appendChild(renderer.domElement);

      // ── Dynamic 3D Liquid Silk Waves Plane ──
      const planeWidth = 140;
      const planeHeight = 100;
      const widthSegments = 100;
      const heightSegments = 80;

      const geometry = new THREE.PlaneGeometry(
        planeWidth,
        planeHeight,
        widthSegments,
        heightSegments
      );

      // Store initial vertex positions for wave equation
      const posAttr = geometry.attributes.position;
      const vertexCount = posAttr.count;
      const originalZ = new Float32Array(vertexCount);
      const originalX = new Float32Array(vertexCount);
      const originalY = new Float32Array(vertexCount);

      for (let i = 0; i < vertexCount; i++) {
        originalX[i] = posAttr.getX(i);
        originalY[i] = posAttr.getY(i);
        originalZ[i] = posAttr.getZ(i);
      }

      // Vertex color gradient attribute (Obsidian ➔ Electric Azure ➔ Champagne Gold)
      const colors = new Float32Array(vertexCount * 3);
      const cDeepIndigo = new THREE.Color(0x0a1128);
      const cElectricCyan = new THREE.Color(0x0088ff);
      const cChampagneGold = new THREE.Color(0xf59e0b);

      geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

      // ── Custom Iridescent Liquid Shader Material ──
      const liquidMaterial = new THREE.MeshStandardMaterial({
        color: 0x070d1e,
        roughness: 0.18,
        metalness: 0.85,
        wireframe: false,
        side: THREE.DoubleSide,
        vertexColors: true,
        flatShading: false,
      });

      const liquidMesh = new THREE.Mesh(geometry, liquidMaterial);
      liquidMesh.rotation.x = -Math.PI / 3.2; // Tilted horizon plane
      liquidMesh.position.set(0, -6, -5);
      scene.add(liquidMesh);

      // ── Secondary Fine Wireframe Silk Lattice ──
      const wireframeMaterial = new THREE.MeshBasicMaterial({
        color: 0x38bdf8,
        wireframe: true,
        transparent: true,
        opacity: 0.09,
      });
      const wireframeMesh = new THREE.Mesh(geometry, wireframeMaterial);
      wireframeMesh.rotation.x = -Math.PI / 3.2;
      wireframeMesh.position.set(0, -5.8, -4.8);
      scene.add(wireframeMesh);

      // ── Floating Starlight Spores on Wave Crests ──
      const sporeCount = 350;
      const sporeGeo = new THREE.BufferGeometry();
      const sporePos = new Float32Array(sporeCount * 3);
      const sporeColors = new Float32Array(sporeCount * 3);

      for (let i = 0; i < sporeCount; i++) {
        sporePos[i * 3] = (Math.random() - 0.5) * 120;
        sporePos[i * 3 + 1] = (Math.random() - 0.5) * 80;
        sporePos[i * 3 + 2] = (Math.random() - 0.5) * 30 + 10;

        const isGold = Math.random() > 0.6;
        const col = isGold ? cChampagneGold : cElectricCyan;
        sporeColors[i * 3] = col.r;
        sporeColors[i * 3 + 1] = col.g;
        sporeColors[i * 3 + 2] = col.b;
      }

      sporeGeo.setAttribute('position', new THREE.BufferAttribute(sporePos, 3));
      sporeGeo.setAttribute('color', new THREE.BufferAttribute(sporeColors, 3));

      // Crisp circle texture for spore glow
      const canvas = document.createElement('canvas');
      canvas.width = 32;
      canvas.height = 32;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
        gradient.addColorStop(0.3, 'rgba(56, 189, 248, 0.7)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 32, 32);
      }
      const sporeTexture = new THREE.CanvasTexture(canvas);

      const sporeMat = new THREE.PointsMaterial({
        size: 2.2,
        map: sporeTexture,
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });

      const spores = new THREE.Points(sporeGeo, sporeMat);
      scene.add(spores);

      // ── Studio Dynamic Lighting (Electric Azure & Champagne Gold) ──
      const ambientLight = new THREE.AmbientLight(0x0f172a, 2.2);
      scene.add(ambientLight);

      // Main Cyan Point Light (Follows mouse)
      const cyanLight = new THREE.PointLight(0x0088ff, 65, 120, 1.2);
      cyanLight.position.set(-20, 10, 25);
      scene.add(cyanLight);

      // Warm Gold Accent Light
      const goldLight = new THREE.PointLight(0xf59e0b, 50, 100, 1.2);
      goldLight.position.set(25, -10, 20);
      scene.add(goldLight);

      // Deep Indigo Rim Light
      const rimLight = new THREE.DirectionalLight(0x6366f1, 2.0);
      rimLight.position.set(0, 30, 10);
      scene.add(rimLight);

      // ── Mouse Interactivity & Wave Ripple Physics ──
      let mouseX = 0;
      let mouseY = 0;
      let targetMouseX = 0;
      let targetMouseY = 0;
      let rippleIntensity = 0;

      const onMouseMove = (e: MouseEvent) => {
        const halfW = window.innerWidth / 2;
        const halfH = window.innerHeight / 2;
        targetMouseX = (e.clientX - halfW) / halfW; // -1 to 1
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

      // ── Animation Loop ──
      const clock = new THREE.Clock();

      const animate = () => {
        if (isDisposed || !renderer) return;
        animationFrameId = requestAnimationFrame(animate);

        const elapsedTime = clock.getElapsedTime();

        // Smooth mouse easing
        mouseX += (targetMouseX - mouseX) * 0.05;
        mouseY += (targetMouseY - mouseY) * 0.05;
        rippleIntensity *= 0.96; // decay

        // Dynamic light positions tracking mouse
        cyanLight.position.x = mouseX * 40 - 15;
        cyanLight.position.y = -mouseY * 25 + 10;

        goldLight.position.x = -mouseX * 35 + 20;
        goldLight.position.y = mouseY * 20 - 10;

        // Camera micro parallax
        camera.position.x = mouseX * 6;
        camera.position.y = -18 + mouseY * 4;
        camera.lookAt(0, 0, 0);

        // ── Liquid Wave Formula: Multi-Frequency Sine/Cosine Waves ──
        const positions = geometry.attributes.position;
        const colAttr = geometry.attributes.color;

        for (let i = 0; i < vertexCount; i++) {
          const x = originalX[i];
          const y = originalY[i];

          // Multi-harmonic fluid wave mathematics
          const wave1 = Math.sin(x * 0.08 + elapsedTime * 1.4) * 3.5;
          const wave2 = Math.cos(y * 0.09 + elapsedTime * 1.1) * 2.8;
          const wave3 = Math.sin((x * 0.05 + y * 0.05) + elapsedTime * 1.8) * 2.2;
          const wave4 = Math.cos(Math.sqrt(x * x + y * y) * 0.1 - elapsedTime * 2.0) * 1.5;

          // Interactive mouse wave disturbance
          const distToMouse = Math.hypot(x - mouseX * 40, y - (-mouseY * 30));
          const mouseWave = Math.sin(distToMouse * 0.2 - elapsedTime * 4.0) * Math.exp(-distToMouse * 0.05) * 4.0 * rippleIntensity;

          const totalZ = wave1 + wave2 + wave3 + wave4 + mouseWave;
          positions.setZ(i, totalZ);

          // Calculate height-based color blending
          const normalizedZ = (totalZ + 8) / 18; // 0 to 1
          const clamped = Math.max(0, Math.min(1, normalizedZ));

          let blendedCol = new THREE.Color();
          if (clamped < 0.5) {
            blendedCol.lerpColors(cDeepIndigo, cElectricCyan, clamped * 2);
          } else {
            blendedCol.lerpColors(cElectricCyan, cChampagneGold, (clamped - 0.5) * 2);
          }

          colAttr.setXYZ(i, blendedCol.r, blendedCol.g, blendedCol.b);
        }

        positions.needsUpdate = true;
        colAttr.needsUpdate = true;
        geometry.computeVertexNormals();

        // Slow wave rotation
        liquidMesh.rotation.z = Math.sin(elapsedTime * 0.15) * 0.04;
        wireframeMesh.rotation.z = liquidMesh.rotation.z;

        // Floating spores drift
        spores.rotation.y = elapsedTime * 0.03;
        spores.rotation.x = Math.sin(elapsedTime * 0.02) * 0.05;

        renderer.render(scene, camera);
      };

      animate();

      return () => {
        isDisposed = true;
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('resize', onResize);
        if (animationFrameId !== null) {
          cancelAnimationFrame(animationFrameId);
        }

        try {
          if (container && renderer && renderer.domElement && container.contains(renderer.domElement)) {
            container.removeChild(renderer.domElement);
          }
          geometry.dispose();
          liquidMaterial.dispose();
          wireframeMaterial.dispose();
          sporeGeo.dispose();
          sporeMat.dispose();
          sporeTexture.dispose();
          renderer.dispose();
        } catch (_) {}
      };
    } catch (_) {
      return () => {};
    }
  }, [mounted]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#030712]"
      aria-hidden="true"
    >
      {/* Subtle iridescent lighting glow behind fluid plane */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_-10%,rgba(0,136,255,0.18),transparent_70%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_110%,rgba(245,158,11,0.12),transparent_70%)] pointer-events-none" />
    </div>
  );
}
