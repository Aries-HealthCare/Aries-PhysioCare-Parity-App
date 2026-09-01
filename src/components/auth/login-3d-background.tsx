'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';

// ── CSS star-layer generator (mobile & fallback) ──────────────────────────────
function generateBoxShadowStars(count: number, spread: number): string {
  const shadows: string[] = [];
  for (let i = 0; i < count; i++) {
    const x = Math.floor(Math.random() * spread);
    const y = Math.floor(Math.random() * spread);
    const opacity = (0.4 + Math.random() * 0.6).toFixed(2);
    shadows.push(`${x}px ${y}px 0 rgba(255,255,255,${opacity})`);
  }
  return shadows.join(',');
}

// Pre-generate star shadows (called once, outside component)
let STAR_SHADOWS_SM = '';
let STAR_SHADOWS_MD = '';
let STAR_SHADOWS_LG = '';

export function Login3DBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hasWebGL, setHasWebGL] = useState(true);
  const [starsReady, setStarsReady] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Generate CSS stars once on mount (client only)
  useEffect(() => {
    if (!STAR_SHADOWS_SM) STAR_SHADOWS_SM = generateBoxShadowStars(700,  3000);
    if (!STAR_SHADOWS_MD) STAR_SHADOWS_MD = generateBoxShadowStars(250,  3000);
    if (!STAR_SHADOWS_LG) STAR_SHADOWS_LG = generateBoxShadowStars(80,   3000);
    setStarsReady(true);

    const mobile = window.innerWidth < 768;
    setIsMobile(mobile);

    // Mobile: skip WebGL entirely
    if (mobile) { setHasWebGL(false); return; }

    const container = containerRef.current;
    if (!container) return;

    let renderer: THREE.WebGLRenderer | null = null;
    let animId: number | null = null;
    let isDisposed = false;
    let lastFrameTime = 0;
    const TARGET_FPS = 45;
    const FRAME_INTERVAL = 1000 / TARGET_FPS;

    // WebGL check
    try {
      const tc = document.createElement('canvas');
      const gl = tc.getContext('webgl') || tc.getContext('experimental-webgl');
      if (!gl) { setHasWebGL(false); return; }
    } catch { setHasWebGL(false); return; }

    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: false,          // off for perf
        powerPreference: 'low-power',
      });
    } catch { setHasWebGL(false); return; }

    if (!renderer) return;

    try {
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
      camera.position.z = 1;

      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5)); // cap at 1.5x
      renderer.setClearColor(0x030408, 1);
      container.appendChild(renderer.domElement);

      // ── Helper: create a star layer ──────────────────────────────────────
      function createStarLayer(count: number, spread: number, size: number, opacity: number) {
        const geo = new THREE.BufferGeometry();
        const pos = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
          pos[i * 3]     = (Math.random() - 0.5) * spread;
          pos[i * 3 + 1] = (Math.random() - 0.5) * spread;
          pos[i * 3 + 2] = (Math.random() - 0.5) * spread * 0.1;
        }
        geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
        const mat = new THREE.PointsMaterial({
          color: 0xffffff,
          size,
          transparent: true,
          opacity,
          sizeAttenuation: false,
        });
        return new THREE.Points(geo, mat);
      }

      // 5 star layers — near (fast) to far (slow)
      const layers = [
        createStarLayer(2000, 800, 1.5, 0.9),
        createStarLayer(1400, 600, 1.2, 0.75),
        createStarLayer(900,  400, 0.9, 0.6),
        createStarLayer(500,  250, 0.7, 0.45),
        createStarLayer(200,  120, 0.5, 0.3),
      ];
      const parallaxFactors = [0.28, 0.18, 0.11, 0.06, 0.02];
      layers.forEach(l => scene.add(l));

      // ── Nebula gas cloud (GLSL ShaderMaterial — 1 draw call) ─────────────
      const nebulaMat = new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: {
          uTime:      { value: 0 },
          uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
          uMouse:     { value: new THREE.Vector2(0.5, 0.5) },
        },
        vertexShader: `
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          uniform float uTime;
          uniform vec2 uResolution;
          uniform vec2 uMouse;
          varying vec2 vUv;

          // Value noise (no deps)
          float hash(vec2 p) {
            return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
          }
          float noise(vec2 p) {
            vec2 i = floor(p);
            vec2 f = fract(p);
            vec2 u = f * f * (3.0 - 2.0 * f);
            return mix(
              mix(hash(i + vec2(0,0)), hash(i + vec2(1,0)), u.x),
              mix(hash(i + vec2(0,1)), hash(i + vec2(1,1)), u.x),
              u.y
            );
          }
          float fbm(vec2 p) {
            float v = 0.0; float a = 0.5;
            for (int i = 0; i < 5; i++) {
              v += a * noise(p);
              p *= 2.0; a *= 0.5;
            }
            return v;
          }

          void main() {
            vec2 uv = vUv - 0.5;
            uv.x *= uResolution.x / uResolution.y;

            // Slow nebula drift
            float t = uTime * 0.04;
            vec2 mouse = (uMouse - 0.5) * 0.12;

            float n1 = fbm(uv * 2.2 + vec2(t, t * 0.6) + mouse);
            float n2 = fbm(uv * 3.5 - vec2(t * 0.8, t) - mouse * 0.5);
            float n3 = fbm(uv * 1.8 + vec2(t * 0.5, -t * 0.4));

            float cloud = n1 * 0.55 + n2 * 0.30 + n3 * 0.15;
            cloud = smoothstep(0.38, 0.72, cloud);

            // Nebula color: indigo base, violet mid, rose peak
            vec3 colDeep   = vec3(0.04, 0.02, 0.14);  // deep indigo
            vec3 colMid    = vec3(0.18, 0.06, 0.38);  // violet
            vec3 colBright = vec3(0.48, 0.08, 0.32);  // rose

            vec3 col = mix(colDeep, colMid, cloud);
            col = mix(col, colBright, cloud * cloud);

            // Radial fade — denser in center
            float radial = 1.0 - smoothstep(0.25, 0.65, length(uv));
            float alpha = cloud * radial * 0.65;

            gl_FragColor = vec4(col, alpha);
          }
        `,
      });
      const nebulaGeo = new THREE.PlaneGeometry(2, 2);
      const nebula = new THREE.Mesh(nebulaGeo, nebulaMat);
      nebula.position.z = -1;
      scene.add(nebula);

      // ── Shooting star ────────────────────────────────────────────────────
      function spawnShootingStar() {
        const geo = new THREE.BufferGeometry();
        const length = 0.06 + Math.random() * 0.1;
        const startX = (Math.random() - 0.5) * 4;
        const startY = Math.random() * 2 - 0.5;
        const angle = -0.4 - Math.random() * 0.4;
        const endX = startX + Math.cos(angle) * length;
        const endY = startY + Math.sin(angle) * length;

        geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array([
          startX, startY, 0,
          endX,   endY,   0,
        ]), 3));

        const mat = new THREE.LineBasicMaterial({
          color: 0xffffff,
          transparent: true,
          opacity: 0,
        });
        const line = new THREE.Line(geo, mat);
        scene.add(line);

        gsap.timeline({ onComplete: () => { scene.remove(line); geo.dispose(); mat.dispose(); } })
          .to(mat, { opacity: 0.95, duration: 0.08 })
          .to(mat, { opacity: 0, duration: 0.35 });

        // Schedule next
        gsap.delayedCall(4 + Math.random() * 6, spawnShootingStar);
      }
      gsap.delayedCall(2 + Math.random() * 3, spawnShootingStar);

      // ── Mouse tracking (pure JS, no React state) ─────────────────────────
      let mouseX = 0, mouseY = 0;
      let targetX = 0, targetY = 0;

      const onMouseMove = (e: MouseEvent) => {
        targetX = (e.clientX / window.innerWidth  - 0.5);
        targetY = (e.clientY / window.innerHeight - 0.5);
      };
      window.addEventListener('mousemove', onMouseMove, { passive: true });

      const onResize = () => {
        if (!renderer) return;
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        nebulaMat.uniforms.uResolution.value.set(window.innerWidth, window.innerHeight);
      };
      window.addEventListener('resize', onResize);

      // ── 45fps-capped animation loop ───────────────────────────────────────
      const clock = new THREE.Clock();

      const animate = (now: number) => {
        if (isDisposed || !renderer) return;
        animId = requestAnimationFrame(animate);

        const delta = now - lastFrameTime;
        if (delta < FRAME_INTERVAL) return; // skip frame — maintain 45fps cap
        lastFrameTime = now - (delta % FRAME_INTERVAL);

        const t = clock.getElapsedTime();

        // Lerp mouse
        mouseX += (targetX - mouseX) * 0.06;
        mouseY += (targetY - mouseY) * 0.06;

        // Parallax per layer
        layers.forEach((layer, i) => {
          layer.position.x = -mouseX * parallaxFactors[i] * 100;
          layer.position.y =  mouseY * parallaxFactors[i] * 80;
          // Subtle slow drift
          layer.position.x += Math.sin(t * 0.05 + i) * 0.3;
          layer.position.y += Math.cos(t * 0.04 + i) * 0.2;
        });

        nebulaMat.uniforms.uTime.value  = t;
        nebulaMat.uniforms.uMouse.value.set(mouseX + 0.5, -mouseY + 0.5);

        renderer.render(scene, camera);
      };
      requestAnimationFrame(animate);

      return () => {
        isDisposed = true;
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('resize', onResize);
        gsap.killTweensOf('*');
        if (animId !== null) cancelAnimationFrame(animId);
        try {
          if (container && renderer?.domElement && container.contains(renderer.domElement))
            container.removeChild(renderer.domElement);
          layers.forEach(l => { (l.geometry as THREE.BufferGeometry).dispose(); (l.material as THREE.Material).dispose(); });
          nebulaGeo.dispose(); nebulaMat.dispose();
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
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
      style={{ background: '#030408' }}
      aria-hidden="true"
    >
      {/* Three.js canvas mounts here (desktop) */}
      <div ref={containerRef} className="absolute inset-0" />

      {/* ── CSS star layers (mobile primary, desktop supplement) ── */}
      {starsReady && (
        <>
          {/* Layer 1 — small distant stars */}
          <div
            className="absolute pointer-events-none"
            style={{
              width: 1, height: 1,
              borderRadius: '50%',
              background: 'transparent',
              boxShadow: STAR_SHADOWS_SM,
              opacity: isMobile ? 0.7 : 0,  // only show on mobile
              animation: 'starDriftSlow 120s linear infinite',
            }}
          />
          {/* Layer 2 — medium stars */}
          <div
            className="absolute pointer-events-none"
            style={{
              width: 2, height: 2,
              borderRadius: '50%',
              background: 'transparent',
              boxShadow: STAR_SHADOWS_MD,
              opacity: isMobile ? 0.55 : 0,
              animation: 'starDriftMed 80s linear infinite',
            }}
          />
          {/* Layer 3 — large close stars */}
          <div
            className="absolute pointer-events-none"
            style={{
              width: 3, height: 3,
              borderRadius: '50%',
              background: 'transparent',
              boxShadow: STAR_SHADOWS_LG,
              opacity: isMobile ? 0.45 : 0,
              animation: 'starDriftFast 50s linear infinite',
            }}
          />

          {/* Mobile nebula glow (CSS only) */}
          {isMobile && (
            <>
              <div className="absolute pointer-events-none" style={{
                width: '90vw', height: '90vw', borderRadius: '50%',
                top: '5%', left: '-20%',
                background: 'radial-gradient(circle, rgba(88,28,235,0.28) 0%, transparent 65%)',
                filter: 'blur(80px)',
                animation: 'nebulaDrift1 20s ease-in-out infinite alternate',
              }} />
              <div className="absolute pointer-events-none" style={{
                width: '70vw', height: '70vw', borderRadius: '50%',
                bottom: '10%', right: '-15%',
                background: 'radial-gradient(circle, rgba(190,24,93,0.22) 0%, transparent 65%)',
                filter: 'blur(90px)',
                animation: 'nebulaDrift2 25s ease-in-out infinite alternate',
              }} />
              <div className="absolute pointer-events-none" style={{
                width: '55vw', height: '55vw', borderRadius: '50%',
                top: '40%', left: '30%',
                background: 'radial-gradient(circle, rgba(67,20,180,0.18) 0%, transparent 65%)',
                filter: 'blur(70px)',
                animation: 'nebulaDrift3 30s ease-in-out infinite alternate',
              }} />

              {/* CSS shooting star */}
              <div className="absolute pointer-events-none" style={{
                width: 80, height: 1,
                top: '20%', left: '-10%',
                background: 'linear-gradient(90deg, rgba(255,255,255,0.9), transparent)',
                borderRadius: 1,
                animation: 'cssShoot 6s ease-in 2s infinite',
                transform: 'rotate(-20deg)',
              }} />
            </>
          )}
        </>
      )}

      {/* No-WebGL desktop nebula fallback */}
      {!hasWebGL && !isMobile && (
        <>
          <div className="absolute pointer-events-none" style={{
            width: '110vw', height: '110vw', borderRadius: '50%',
            top: '-20%', left: '-25%',
            background: 'radial-gradient(circle, rgba(88,28,235,0.25) 0%, transparent 60%)',
            filter: 'blur(100px)',
            animation: 'nebulaDrift1 22s ease-in-out infinite alternate',
          }} />
          <div className="absolute pointer-events-none" style={{
            width: '80vw', height: '80vw', borderRadius: '50%',
            bottom: '-10%', right: '-20%',
            background: 'radial-gradient(circle, rgba(190,24,93,0.2) 0%, transparent 60%)',
            filter: 'blur(110px)',
            animation: 'nebulaDrift2 28s ease-in-out infinite alternate',
          }} />
        </>
      )}

      <style>{`
        @keyframes starDriftSlow {
          from { transform: translateY(0); }
          to   { transform: translateY(-3000px); }
        }
        @keyframes starDriftMed {
          from { transform: translateY(0) translateX(0); }
          to   { transform: translateY(-3000px) translateX(20px); }
        }
        @keyframes starDriftFast {
          from { transform: translateY(0) translateX(0); }
          to   { transform: translateY(-3000px) translateX(-30px); }
        }
        @keyframes nebulaDrift1 {
          0%   { transform: translate(0, 0) scale(1); }
          50%  { transform: translate(6vw, -5vh) scale(1.15); }
          100% { transform: translate(-4vw, 8vh) scale(0.92); }
        }
        @keyframes nebulaDrift2 {
          0%   { transform: translate(0, 0) scale(1); }
          50%  { transform: translate(-8vw, 6vh) scale(1.1); }
          100% { transform: translate(5vw, -7vh) scale(1.05); }
        }
        @keyframes nebulaDrift3 {
          0%   { transform: translate(0, 0) scale(1); }
          50%  { transform: translate(4vw, -8vh) scale(1.2); }
          100% { transform: translate(-6vw, 4vh) scale(0.9); }
        }
        @keyframes cssShoot {
          0%   { transform: translateX(0) rotate(-20deg); opacity: 0; }
          5%   { opacity: 1; }
          25%  { transform: translateX(110vw) rotate(-20deg); opacity: 0; }
          100% { transform: translateX(110vw) rotate(-20deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
