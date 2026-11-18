'use client';

import React, { useEffect, useRef } from 'react';

interface QuantumLoomCanvasProps {
  className?: string;
  onWebGLActive?: (active: boolean) => void;
}

export function QuantumLoomCanvas({ className = '', onWebGLActive }: QuantumLoomCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Check WebGL availability with performance-first flags
    const gl = canvas.getContext('webgl', {
      powerPreference: 'low-power',
      alpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      preserveDrawingBuffer: false,
    });
    if (!gl) {
      onWebGLActive?.(false);
      return;
    }
    onWebGLActive?.(true);

    const vsSource = `
      attribute vec2 position;
      void main() {
        gl_Position = vec4(position, 0.0, 1.0);
      }
    `;

    // High-performance optimized Quantum Loom GLSL shader with luminous neon bloom
    const fsSource = `
      precision mediump float;
      uniform vec2 u_res;
      uniform float u_time;

      vec2 rot(vec2 p, float a) {
        float c = cos(a), s = sin(a);
        return vec2(p.x * c - p.y * s, p.x * s + p.y * c);
      }

      void main() {
        vec2 uv = (gl_FragCoord.xy - 0.5 * u_res.xy) / min(u_res.x, u_res.y);
        vec3 col = vec3(0.002, 0.002, 0.005);

        float t = u_time * 0.2;
        float loom = 0.0;
        vec2 p = uv * 3.2;
        
        for (int i = 1; i <= 5; i++) {
          float fi = float(i);
          p = rot(p, 0.4 + sin(t * 0.1 + fi) * 0.2);
          p += vec2(sin(p.y * 2.0 + t), cos(p.x * 2.0 - t)) * 0.3;
          float line = abs(sin(p.x * 3.0 + p.y * 3.0 + t * fi));
          loom += 0.024 / (line + 0.028);
        }

        // Glowing Luminous Amber Flame & White-Hot Incandescent Core
        vec3 amberFlame = vec3(1.0, 0.52, 0.14) * loom * 1.35;
        vec3 whiteHotCore = vec3(1.0, 0.96, 0.82) * pow(loom * 0.20, 2.4);
        vec3 radiantBloom = vec3(0.98, 0.40, 0.06) * pow(loom * 0.12, 1.8);
        vec3 darkPlenum = vec3(0.04, 0.01, 0.08) * length(uv);

        col = amberFlame + whiteHotCore + radiantBloom + darkPlenum;
        col *= smoothstep(1.7, 0.15, length(uv));

        gl_FragColor = vec4(col, 1.0);
      }
    `;

    function createShader(glCtx: WebGLRenderingContext, type: number, source: string) {
      const shader = glCtx.createShader(type);
      if (!shader) return null;
      glCtx.shaderSource(shader, source);
      glCtx.compileShader(shader);
      if (!glCtx.getShaderParameter(shader, glCtx.COMPILE_STATUS)) {
        glCtx.deleteShader(shader);
        return null;
      }
      return shader;
    }

    const vShader = createShader(gl, gl.VERTEX_SHADER, vsSource);
    const fShader = createShader(gl, gl.FRAGMENT_SHADER, fsSource);
    if (!vShader || !fShader) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vShader);
    gl.attachShader(program, fShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      gl.deleteProgram(program);
      return;
    }

    const posBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW
    );

    const posLoc = gl.getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    const resLoc = gl.getUniformLocation(program, 'u_res');
    const timeLoc = gl.getUniformLocation(program, 'u_time');

    let animationFrameId: number;
    let isVisible = true;
    let isIntersecting = true;

    function resize() {
      if (!canvas || !gl) return;
      // High performance 1.0 DPR for laser-sharp HD filaments without wasting GPU cycles
      const dpr = Math.min(window.devicePixelRatio || 1, 1.0);
      const width = Math.max(320, Math.floor(canvas.clientWidth * dpr));
      const height = Math.max(240, Math.floor(canvas.clientHeight * dpr));

      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
        gl.viewport(0, 0, width, height);
      }
    }

    const handleVisibility = () => {
      isVisible = !document.hidden;
    };
    document.addEventListener('visibilitychange', handleVisibility);

    // Pause WebGL rendering entirely when user scrolls down away from hero
    const observer = new IntersectionObserver(
      ([entry]) => {
        isIntersecting = entry.isIntersecting;
      },
      { threshold: 0.05 }
    );
    observer.observe(canvas);

    window.addEventListener('resize', resize);
    resize();

    const startTime = performance.now();
    let lastFrameTime = 0;
    const FRAME_INTERVAL = 1000 / 45; // 45 FPS target: fluid visual cadence with minimal GPU drain

    function render(now: number) {
      if (isVisible && isIntersecting && gl && program) {
        if (now - lastFrameTime >= FRAME_INTERVAL) {
          lastFrameTime = now;
          const time = (now - startTime) * 0.001;
          gl.useProgram(program);
          gl.uniform2f(resLoc, canvas!.width, canvas!.height);
          gl.uniform1f(timeLoc, time);
          gl.drawArrays(gl.TRIANGLES, 0, 6);
        }
      }
      animationFrameId = requestAnimationFrame(render);
    }

    render(performance.now());

    return () => {
      cancelAnimationFrame(animationFrameId);
      observer.disconnect();
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('resize', resize);
      if (gl) {
        gl.deleteProgram(program);
        gl.deleteShader(vShader);
        gl.deleteShader(fShader);
        gl.deleteBuffer(posBuffer);
      }
    };
  }, [onWebGLActive]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full pointer-events-none select-none ${className}`}
      style={{ background: '#000002' }}
    />
  );
}
