'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export function Login3DBackground() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance',
      });
    } catch {
      return;
    }

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x020612, 0.0008);

    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      2500
    );
    camera.position.z = 200;

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    container.appendChild(renderer.domElement);

    // ── Create Sharp Star Disk Texture (Tiny, crisp pinpoint with subtle glow) ──
    const createCrispStarTexture = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 32;
      canvas.height = 32;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
        gradient.addColorStop(0.2, 'rgba(255, 255, 255, 0.9)');
        gradient.addColorStop(0.5, 'rgba(180, 220, 255, 0.4)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 32, 32);
      }
      return new THREE.CanvasTexture(canvas);
    };

    const createGlowStarTexture = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 64;
      canvas.height = 64;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
        gradient.addColorStop(0.25, 'rgba(140, 200, 255, 0.8)');
        gradient.addColorStop(0.6, 'rgba(80, 120, 255, 0.25)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 64, 64);
      }
      return new THREE.CanvasTexture(canvas);
    };

    const crispStarTexture = createCrispStarTexture();
    const glowStarTexture = createGlowStarTexture();

    // ── 1. Deep Celestial Starfield (3,500 Tiny Crisp Pinpoint Stars) ──
    const starCount = 3500;
    const starGeo = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);

    const cWhite = new THREE.Color(0xffffff);
    const cIcyBlue = new THREE.Color(0x93c5fd);
    const cDeepSky = new THREE.Color(0x38bdf8);
    const cStellarGold = new THREE.Color(0xfde047);
    const cSoftPurple = new THREE.Color(0xc084fc);

    for (let i = 0; i < starCount; i++) {
      // Spread across deep 3D sphere
      const radius = 200 + Math.random() * 900;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      starPositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      starPositions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      starPositions[i * 3 + 2] = radius * Math.cos(phi);

      const rand = Math.random();
      let col = cWhite;
      if (rand > 0.8) col = cIcyBlue;
      else if (rand > 0.65) col = cDeepSky;
      else if (rand > 0.52) col = cStellarGold;
      else if (rand > 0.44) col = cSoftPurple;

      starColors[i * 3] = col.r;
      starColors[i * 3 + 1] = col.g;
      starColors[i * 3 + 2] = col.b;
    }

    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    starGeo.setAttribute('color', new THREE.BufferAttribute(starColors, 3));

    const starMat = new THREE.PointsMaterial({
      size: 1.8,
      map: crispStarTexture,
      vertexColors: true,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const starField = new THREE.Points(starGeo, starMat);
    scene.add(starField);

    // ── 2. Twinkling Major Stars & Pulsars (250 Sparkling Stars) ──
    const pulsarCount = 250;
    const pulsarGeo = new THREE.BufferGeometry();
    const pulsarPositions = new Float32Array(pulsarCount * 3);
    const pulsarColors = new Float32Array(pulsarCount * 3);

    for (let i = 0; i < pulsarCount; i++) {
      pulsarPositions[i * 3] = (Math.random() - 0.5) * 600;
      pulsarPositions[i * 3 + 1] = (Math.random() - 0.5) * 450;
      pulsarPositions[i * 3 + 2] = (Math.random() - 0.5) * 400;

      const isBlue = Math.random() > 0.4;
      const col = isBlue ? cDeepSky : cStellarGold;
      pulsarColors[i * 3] = col.r;
      pulsarColors[i * 3 + 1] = col.g;
      pulsarColors[i * 3 + 2] = col.b;
    }

    pulsarGeo.setAttribute('position', new THREE.BufferAttribute(pulsarPositions, 3));
    pulsarGeo.setAttribute('color', new THREE.BufferAttribute(pulsarColors, 3));

    const pulsarMat = new THREE.PointsMaterial({
      size: 3.8,
      map: glowStarTexture,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const pulsars = new THREE.Points(pulsarGeo, pulsarMat);
    scene.add(pulsars);

    // ── 3. Galactic Cosmic Dust Ribbon (Milky Way Ribbon) ──
    const dustCount = 1800;
    const dustGeo = new THREE.BufferGeometry();
    const dustPositions = new Float32Array(dustCount * 3);
    const dustColors = new Float32Array(dustCount * 3);

    const cDustNavy = new THREE.Color(0x1e3a8a);
    const cDustCyan = new THREE.Color(0x0284c7);
    const cDustPurple = new THREE.Color(0x6b21a8);

    for (let i = 0; i < dustCount; i++) {
      const t = (i / dustCount) * 2 - 1; // -1 to 1 along ribbon curve
      const x = t * 500 + (Math.random() - 0.5) * 80;
      const y = Math.sin(t * 3.5) * 120 + (Math.random() - 0.5) * 70;
      const z = Math.cos(t * 3.5) * 120 - 50 + (Math.random() - 0.5) * 60;

      dustPositions[i * 3] = x;
      dustPositions[i * 3 + 1] = y;
      dustPositions[i * 3 + 2] = z;

      const rand = Math.random();
      const col = rand > 0.6 ? cDustCyan : rand > 0.3 ? cDustNavy : cDustPurple;
      dustColors[i * 3] = col.r;
      dustColors[i * 3 + 1] = col.g;
      dustColors[i * 3 + 2] = col.b;
    }

    dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));
    dustGeo.setAttribute('color', new THREE.BufferAttribute(dustColors, 3));

    const dustMat = new THREE.PointsMaterial({
      size: 2.2,
      map: crispStarTexture,
      vertexColors: true,
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const dustRibbon = new THREE.Points(dustGeo, dustMat);
    scene.add(dustRibbon);

    // ── 4. Shooting Stars (Meteors) ──
    interface Meteor {
      mesh: THREE.Line;
      velocity: THREE.Vector3;
      active: boolean;
      life: number;
    }

    const meteors: Meteor[] = [];
    const meteorCount = 4;

    for (let i = 0; i < meteorCount; i++) {
      const lineGeo = new THREE.BufferGeometry();
      const vertices = new Float32Array([
        0, 0, 0,
        -25, -15, -12,
      ]);
      const colors = new Float32Array([
        1, 1, 1,
        0.1, 0.5, 1,
      ]);
      lineGeo.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
      lineGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

      const lineMat = new THREE.LineBasicMaterial({
        vertexColors: true,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        linewidth: 2,
      });

      const mesh = new THREE.Line(lineGeo, lineMat);
      scene.add(mesh);

      meteors.push({
        mesh,
        velocity: new THREE.Vector3(-3.5, -2.2, -1.8),
        active: false,
        life: 0,
      });
    }

    const spawnMeteor = (meteor: Meteor) => {
      meteor.mesh.position.set(
        (Math.random() - 0.2) * 350 + 100,
        Math.random() * 200 + 80,
        Math.random() * 100 - 50
      );
      meteor.life = 1.0;
      meteor.active = true;
    };

    // ── Smooth Mouse Movement Tracking ──
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const onMouseMove = (e: MouseEvent) => {
      const halfW = window.innerWidth / 2;
      const halfH = window.innerHeight / 2;
      targetX = (e.clientX - halfW) * 0.04;
      targetY = (e.clientY - halfH) * 0.04;
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });

    const onResize = () => {
      if (!container) return;
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', onResize);

    // ── Animation Loop ──
    let animationFrameId: number;
    const clock = new THREE.Clock();
    let nextMeteorTime = 1.5;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Smooth camera parallax
      mouseX += (targetX - mouseX) * 0.05;
      mouseY += (targetY - mouseY) * 0.05;

      camera.position.x = mouseX * 0.8;
      camera.position.y = -mouseY * 0.8;
      camera.lookAt(scene.position);

      // Deep space slow rotation
      starField.rotation.y = elapsedTime * 0.008;
      starField.rotation.x = Math.sin(elapsedTime * 0.005) * 0.02;

      dustRibbon.rotation.y = -elapsedTime * 0.005;
      dustRibbon.rotation.z = Math.cos(elapsedTime * 0.004) * 0.03;

      pulsars.rotation.y = elapsedTime * 0.012;

      // Twinkling pulsars pulse
      pulsarMat.opacity = 0.75 + Math.sin(elapsedTime * 4.5) * 0.25;

      // Shooting stars
      if (elapsedTime > nextMeteorTime) {
        const available = meteors.find((m) => !m.active);
        if (available) {
          spawnMeteor(available);
        }
        nextMeteorTime = elapsedTime + Math.random() * 2.8 + 1.2;
      }

      meteors.forEach((meteor) => {
        if (meteor.active) {
          meteor.mesh.position.add(meteor.velocity);
          meteor.life -= 0.03;
          (meteor.mesh.material as THREE.LineBasicMaterial).opacity = Math.max(0, meteor.life);
          if (meteor.life <= 0) {
            meteor.active = false;
          }
        }
      });

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', onResize);
      cancelAnimationFrame(animationFrameId);

      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }

      starGeo.dispose();
      starMat.dispose();
      pulsarGeo.dispose();
      pulsarMat.dispose();
      dustGeo.dispose();
      dustMat.dispose();
      crispStarTexture.dispose();
      glowStarTexture.dispose();
      meteors.forEach((m) => {
        m.mesh.geometry.dispose();
        (m.mesh.material as THREE.Material).dispose();
      });
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#030712]"
      aria-hidden="true"
    />
  );
}
