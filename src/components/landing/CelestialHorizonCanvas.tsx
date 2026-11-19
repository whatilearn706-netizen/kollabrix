'use client';

import React, { useEffect, useRef } from 'react';

interface CelestialHorizonCanvasProps {
  className?: string;
  onWebGLActive?: (active: boolean) => void;
}

export function CelestialHorizonCanvas({ className = '', onWebGLActive }: CelestialHorizonCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

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

    // Real-time Celestial Blue Horizon Shader
    // Recreates the Dribbble Auralis ethereal cosmic horizon with glowing central dawn star and slow undulating mist
    const fsSource = `
      precision mediump float;
      uniform vec2 u_res;
      uniform float u_time;

      void main() {
        vec2 uv = (gl_FragCoord.xy - 0.5 * u_res.xy) / min(u_res.x, u_res.y);
        
        // Time scale for slow majestic cosmic motion
        float t = u_time * 0.18;

        // Base background: Deep cosmic night sky fading to oceanic midnight blue
        vec3 deepNight = vec3(0.004, 0.012, 0.035);
        vec3 horizonBlue = vec3(0.04, 0.18, 0.45);
        vec3 skyColor = mix(deepNight, horizonBlue, smoothstep(0.45, -0.15, uv.y));

        // The Central Dawn Star / Celestial Beacon on the Horizon
        vec2 starPos = vec2(0.0, 0.08);
        vec2 starDelta = uv - starPos;
        // Horizontal atmospheric stretch for a realistic horizon flare
        float starDist = length(starDelta * vec2(1.0, 2.2));
        
        // Multi-tier incandescent glow
        float core = 0.0045 / (starDist + 0.008);
        float halo = 0.045 / (starDist * 3.2 + 0.12);
        float softGlow = 0.18 * exp(-starDist * 2.8);
        
        vec3 starLight = vec3(0.85, 0.94, 1.0) * (core * 1.4)
                       + vec3(0.38, 0.65, 0.98) * (halo * 1.1)
                       + vec3(0.18, 0.42, 0.85) * softGlow;

        // Undulating Celestial Mist & Cosmic Ocean Waves along the lower half
        float wave1 = sin(uv.x * 2.2 + t * 0.4) * 0.09 + cos(uv.x * 4.5 - t * 0.3) * 0.04;
        float wave2 = sin(uv.x * 3.4 - t * 0.5) * 0.07 + cos(uv.x * 1.8 + t * 0.25) * 0.05;
        
        // Ethereal fog bands
        float fogBand1 = smoothstep(0.18, -0.15, uv.y - wave1) * smoothstep(-0.6, -0.05, uv.y - wave1);
        float fogBand2 = smoothstep(0.05, -0.35, uv.y - wave2) * smoothstep(-0.8, -0.18, uv.y - wave2);

        vec3 mistColor1 = vec3(0.12, 0.35, 0.75) * fogBand1 * 0.65;
        vec3 mistColor2 = vec3(0.06, 0.20, 0.50) * fogBand2 * 0.55;

        // Horizon illumination line
        float horizonLine = exp(-abs(uv.y - 0.08) * 18.0) * 0.45;
        vec3 horizonGlow = vec3(0.25, 0.55, 0.95) * horizonLine * smoothstep(1.2, 0.0, abs(uv.x));

        // Assemble final composition
        vec3 finalCol = skyColor + starLight + mistColor1 + mistColor2 + horizonGlow;

        // Bottom and edge vignette to ensure deep contrast and seamless blend into page (#090B10 / #000002)
        float bottomFade = smoothstep(-0.55, -0.15, uv.y);
        finalCol = mix(vec3(0.002, 0.003, 0.008), finalCol, bottomFade);
        
        // Top edge vignette
        float topFade = smoothstep(0.65, 0.25, uv.y);
        finalCol = mix(vec3(0.001, 0.003, 0.008), finalCol, topFade);

        gl_FragColor = vec4(finalCol, 1.0);
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
      if (isVisible && isIntersecting) {
        lastTime = performance.now();
        render(lastTime);
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    let observer: IntersectionObserver | null = null;
    if (typeof IntersectionObserver !== 'undefined') {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            isIntersecting = entry.isIntersecting;
            if (isIntersecting && isVisible) {
              lastTime = performance.now();
              render(lastTime);
            }
          });
        },
        { threshold: 0.05 }
      );
      observer.observe(canvas);
    }

    window.addEventListener('resize', resize, { passive: true });
    resize();

    let lastTime = performance.now();
    let totalTime = 0;

    function render(now: number) {
      if (!isVisible || !isIntersecting || !gl) return;

      const delta = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;
      totalTime += delta;

      gl.useProgram(program);
      gl.uniform2f(resLoc, canvas!.width, canvas!.height);
      gl.uniform1f(timeLoc, totalTime);
      gl.drawArrays(gl.TRIANGLES, 0, 6);

      animationFrameId = requestAnimationFrame(render);
    }

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', handleVisibility);
      observer?.disconnect();

      if (gl) {
        gl.deleteBuffer(posBuffer);
        gl.deleteProgram(program);
        gl.deleteShader(vShader);
        gl.deleteShader(fShader);
      }
    };
  }, [onWebGLActive]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full pointer-events-none select-none ${className}`}
      style={{ display: 'block' }}
    />
  );
}
