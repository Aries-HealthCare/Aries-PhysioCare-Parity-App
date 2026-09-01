'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export function Login3DBackground() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // WebGL Renderer Setup
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
    scene.fog = new THREE.FogExp2(0x02050e, 0.0012);

    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      2000
    );
    camera.position.z = 120;

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3;

    container.appendChild(renderer.domElement);

    // ── Create Soft Star & Nebula Disc Textures ──
    const createStarTexture = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 64;
      canvas.height = 64;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
        gradient.addColorStop(0.15, 'rgba(255, 255, 255, 0.9)');
        gradient.addColorStop(0.4, 'rgba(100, 200, 255, 0.4)');
        gradient.addColorStop(0.8, 'rgba(0, 136, 255, 0.08)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 64, 64);
      }
      return new THREE.CanvasTexture(canvas);
    };

    const createNebulaTexture = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 128;
      canvas.height = 128;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.6)');
        gradient.addColorStop(0.3, 'rgba(0, 136, 255, 0.25)');
        gradient.addColorStop(0.7, 'rgba(255, 215, 0, 0.08)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 128, 128);
      }
      return new THREE.CanvasTexture(canvas);
    };

    const starTexture = createStarTexture();
    const nebulaTexture = createNebulaTexture();

    // ── 1. Distant Starfield (2,400 Stars) ──
    const starCount = 2400;
    const starGeo = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);
    const starOriginalY = new Float32Array(starCount);

    const colorWhite = new THREE.Color(0xffffff);
    const colorCyan = new THREE.Color(0x38bdf8);
    const colorGold = new THREE.Color(0xffd700);
    const colorViolet = new THREE.Color(0x818cf8);

    for (let i = 0; i < starCount; i++) {
      const x = (Math.random() - 0.5) * 800;
      const y = (Math.random() - 0.5) * 600;
      const z = (Math.random() - 0.5) * 700;

      starPositions[i * 3] = x;
      starPositions[i * 3 + 1] = y;
      starPositions[i * 3 + 2] = z;
      starOriginalY[i] = y;

      const rand = Math.random();
      let color = colorWhite;
      if (rand > 0.75) color = colorCyan;
      else if (rand > 0.55) color = colorGold;
      else if (rand > 0.45) color = colorViolet;

      starColors[i * 3] = color.r;
      starColors[i * 3 + 1] = color.g;
      starColors[i * 3 + 2] = color.b;
    }

    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    starGeo.setAttribute('color', new THREE.BufferAttribute(starColors, 3));

    const starMat = new THREE.PointsMaterial({
      size: 2.8,
      map: starTexture,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const starField = new THREE.Points(starGeo, starMat);
    scene.add(starField);

    // ── 2. Bright Pulsars & Close Constellation Nodes (180 Stars) ──
    const pulsarCount = 180;
    const pulsarGeo = new THREE.BufferGeometry();
    const pulsarPositions = new Float32Array(pulsarCount * 3);
    const pulsarColors = new Float32Array(pulsarCount * 3);

    for (let i = 0; i < pulsarCount; i++) {
      pulsarPositions[i * 3] = (Math.random() - 0.5) * 350;
      pulsarPositions[i * 3 + 1] = (Math.random() - 0.5) * 250;
      pulsarPositions[i * 3 + 2] = (Math.random() - 0.5) * 200 + 40;

      const isGold = Math.random() > 0.5;
      const c = isGold ? colorGold : colorCyan;
      pulsarColors[i * 3] = c.r;
      pulsarColors[i * 3 + 1] = c.g;
      pulsarColors[i * 3 + 2] = c.b;
    }

    pulsarGeo.setAttribute('position', new THREE.BufferAttribute(pulsarPositions, 3));
    pulsarGeo.setAttribute('color', new THREE.BufferAttribute(pulsarColors, 3));

    const pulsarMat = new THREE.PointsMaterial({
      size: 5.5,
      map: starTexture,
      vertexColors: true,
      transparent: true,
      opacity: 1,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const pulsars = new THREE.Points(pulsarGeo, pulsarMat);
    scene.add(pulsars);

    // ── 3. Volumetric Cosmic Nebula Clouds (Cyan & Gold Dust) ──
    const nebulaCount = 45;
    const nebulaGeo = new THREE.BufferGeometry();
    const nebulaPositions = new Float32Array(nebulaCount * 3);

    for (let i = 0; i < nebulaCount; i++) {
      nebulaPositions[i * 3] = (Math.random() - 0.5) * 400;
      nebulaPositions[i * 3 + 1] = (Math.random() - 0.5) * 300;
      nebulaPositions[i * 3 + 2] = (Math.random() - 0.5) * 300 - 50;
    }

    nebulaGeo.setAttribute('position', new THREE.BufferAttribute(nebulaPositions, 3));

    const nebulaMat = new THREE.PointsMaterial({
      size: 140,
      map: nebulaTexture,
      transparent: true,
      opacity: 0.18,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      color: 0x0088ff,
    });

    const nebulaCloud = new THREE.Points(nebulaGeo, nebulaMat);
    scene.add(nebulaCloud);

    // ── 4. Shooting Stars (Meteors) ──
    interface Meteor {
      line: THREE.Line;
      velocity: THREE.Vector3;
      active: boolean;
      life: number;
    }

    const meteors: Meteor[] = [];
    const meteorCount = 3;

    for (let i = 0; i < meteorCount; i++) {
      const lineGeo = new THREE.BufferGeometry();
      const points = [new THREE.Vector3(0, 0, 0), new THREE.Vector3(-15, 10, -10)];
      lineGeo.setFromPoints(points);

      const lineMat = new THREE.LineBasicMaterial({
        color: i % 2 === 0 ? 0x00a3ff : 0xffd700,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
      });

      const line = new THREE.Line(lineGeo, lineMat);
      scene.add(line);

      meteors.push({
        line,
        velocity: new THREE.Vector3(-2.8, -1.8, -1.2),
        active: false,
        life: 0,
      });
    }

    const spawnMeteor = (meteor: Meteor) => {
      meteor.line.position.set(
        Math.random() * 200 + 50,
        Math.random() * 120 + 60,
        Math.random() * 80 - 40
      );
      meteor.life = 1.0;
      meteor.active = true;
    };

    // ── Mouse Interactivity with Inertial Smoothing ──
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const onMouseMove = (e: MouseEvent) => {
      const windowHalfX = window.innerWidth / 2;
      const windowHalfY = window.innerHeight / 2;
      targetX = (e.clientX - windowHalfX) * 0.05;
      targetY = (e.clientY - windowHalfY) * 0.05;
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });

    // Window Resize Handler
    const onResize = () => {
      if (!container) return;
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', onResize);

    // ── Space Animation Loop ──
    let animationFrameId: number;
    const clock = new THREE.Clock();
    let nextMeteorTime = 2.0;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Smooth camera parallax
      mouseX += (targetX - mouseX) * 0.04;
      mouseY += (targetY - mouseY) * 0.04;

      camera.position.x = mouseX * 0.7;
      camera.position.y = -mouseY * 0.7;
      camera.lookAt(scene.position);

      // Slow majestic galaxy & starfield rotation
      starField.rotation.y = elapsedTime * 0.012;
      starField.rotation.x = Math.sin(elapsedTime * 0.008) * 0.05;

      pulsars.rotation.y = elapsedTime * 0.018;
      pulsars.rotation.z = Math.cos(elapsedTime * 0.01) * 0.04;

      nebulaCloud.rotation.y = elapsedTime * 0.006;
      nebulaCloud.rotation.x = Math.sin(elapsedTime * 0.005) * 0.03;

      // Twinkling pulsars pulse
      pulsarMat.size = 5.0 + Math.sin(elapsedTime * 4.0) * 1.5;
      pulsarMat.opacity = 0.85 + Math.sin(elapsedTime * 3.0) * 0.15;

      // Shooting stars logic
      if (elapsedTime > nextMeteorTime) {
        const inactive = meteors.find((m) => !m.active);
        if (inactive) {
          spawnMeteor(inactive);
        }
        nextMeteorTime = elapsedTime + Math.random() * 3.5 + 2.0;
      }

      meteors.forEach((meteor) => {
        if (meteor.active) {
          meteor.line.position.add(meteor.velocity);
          meteor.life -= 0.025;
          (meteor.line.material as THREE.LineBasicMaterial).opacity = Math.max(0, meteor.life);
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
      nebulaGeo.dispose();
      nebulaMat.dispose();
      starTexture.dispose();
      nebulaTexture.dispose();
      meteors.forEach((m) => {
        m.line.geometry.dispose();
        (m.line.material as THREE.Material).dispose();
      });
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none z-0 overflow-hidden"
      aria-hidden="true"
    />
  );
}
