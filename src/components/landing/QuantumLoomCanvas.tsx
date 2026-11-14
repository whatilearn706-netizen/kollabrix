'use client';

import React, { useEffect, useRef } from 'react';

interface QuantumLoomCanvasProps {
  className?: string;
}

export function QuantumLoomCanvas({ className = '' }: QuantumLoomCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl', { powerPreference: 'high-performance', alpha: true });
    if (!gl) return;

    const vsSource = `
      attribute vec2 position;
      void main() {
        gl_Position = vec4(position, 0.0, 1.0);
      }
    `;

    // Exact Realm 01 Quantum Loom of Consciousness GLSL shader
    const fsSource = `
      precision highp float;
      uniform vec2 u_res;
      uniform float u_time;

      vec2 rot(vec2 p, float a) {
        float c = cos(a), s = sin(a);
        return vec2(p.x * c - p.y * s, p.x * s + p.y * c);
      }

      void main() {
        vec2 uv = (gl_FragCoord.xy - 0.5 * u_res.xy) / min(u_res.x, u_res.y);
        vec3 col = vec3(0.002, 0.002, 0.005); // Absolute black vacuum

        float t = u_time * 0.2;

        float loom = 0.0;
        vec2 p = uv * 3.5;
        
        for (int i = 1; i <= 6; i++) {
          float fi = float(i);
          p = rot(p, 0.4 + sin(t * 0.1 + fi) * 0.2);
          p += vec2(sin(p.y * 2.0 + t), cos(p.x * 2.0 - t)) * 0.3;
          float line = abs(sin(p.x * 3.0 + p.y * 3.0 + t * fi));
          loom += 0.015 / (line + 0.03);
        }

        // Burning amber core energy with microscopic micro-lightning
        vec3 amberFlame = vec3(1.0, 0.45, 0.08) * loom * 0.7;
        vec3 whiteHotCore = vec3(1.0, 0.9, 0.7) * pow(loom * 0.15, 3.0);
        vec3 darkPlenum = vec3(0.08, 0.02, 0.15) * length(uv);

        col = amberFlame + whiteHotCore + darkPlenum;
        col *= smoothstep(1.5, 0.2, length(uv));

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

    function resize() {
      if (!canvas || !gl) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const width = canvas.clientWidth * dpr;
      const height = canvas.clientHeight * dpr;

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
    window.addEventListener('resize', resize);
    resize();

    const startTime = performance.now();

    function render() {
      if (isVisible && gl && program) {
        const time = (performance.now() - startTime) * 0.001;
        gl.useProgram(program);
        gl.uniform2f(resLoc, canvas!.width, canvas!.height);
        gl.uniform1f(timeLoc, time);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
      }
      animationFrameId = requestAnimationFrame(render);
    }

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('resize', resize);
      if (gl) {
        gl.deleteProgram(program);
        gl.deleteShader(vShader);
        gl.deleteShader(fShader);
        gl.deleteBuffer(posBuffer);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full pointer-events-none select-none ${className}`}
      style={{ background: '#000002' }}
    />
  );
}
