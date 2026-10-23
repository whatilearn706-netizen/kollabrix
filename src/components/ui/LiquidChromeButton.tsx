'use client';

import React, { useEffect, useRef } from 'react';
import clsx from 'clsx';

export interface LiquidChromeButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label?: string;
  height?: number;
  className?: string;
  title?: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
}
const QUAD_VS = `#version 300 es
  in vec2 aPos; void main(){ gl_Position = vec4(aPos, 0., 1.); }`;
const FACE_FS = `#version 300 es
  precision highp float;
  uniform vec2 uRes; uniform float uU; uniform float uTime; uniform float uHover;
  uniform sampler2D uScratch;
  out vec4 fragColor;
  float hash21(vec2 p){ vec3 q=fract(vec3(p.xyx)*.1031); q+=dot(q,q.yzx+33.33); return fract((q.x+q.y)*q.z); }
  vec2 hash22(vec2 p){ vec3 q=fract(vec3(p.xyx)*vec3(.1031,.1030,.0973)); q+=dot(q,q.yzx+33.33); return fract((q.xx+q.yz)*q.zy); }
  float vnoise(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.-2.*f);
    return mix(mix(hash21(i),hash21(i+vec2(1,0)),f.x), mix(hash21(i+vec2(0,1)),hash21(i+vec2(1,1)),f.x), f.y); }
  float fbm(vec2 p){ float a=.5, s=0.; for(int i=0;i<4;i++){ s+=a*vnoise(p); p=p*2.02+vec2(31.7,17.3); a*=.5; } return s; }
  // cellular shards: (nearest, second nearest, cell id)
  vec3 voro(vec2 p){ vec2 i=floor(p), f=fract(p); float d1=9., d2=9.; vec2 id=vec2(0);
    for(int y=-1;y<=1;y++) for(int x=-1;x<=1;x++){ vec2 g=vec2(float(x),float(y)); vec2 r=g+hash22(i+g)-f; float d=dot(r,r);
      if(d<d1){ d2=d1; d1=d; id=i+g; } else if(d<d2){ d2=d; } }
    return vec3(sqrt(d1), sqrt(d2), hash21(id)); }
  float tone(float y){ float t=y/232.; float v=mix(.965,.90,smoothstep(.12,.32,t)); v=mix(v,.70,smoothstep(.32,.64,t)); return mix(v,.50,smoothstep(.64,1.,t)); }

  // ---- liquid metal: a smooth warped field sampled through its own gradient
  float fbm3(vec2 p){ float a=.5, s=0.; for(int i=0;i<3;i++){ s+=a*vnoise(p); p=p*2.02+vec2(31.7,17.3); a*=.5; } return s; }
  float H(vec2 p, float t){
    vec2 w = vec2(fbm3(p*.8 + vec2(0., t*.13)), fbm3(p*.8 + vec2(5.2, -t*.09)));
    return fbm3(p + (w-.5)*1.2 + vec2(t*.04, 0.));
  }
  vec3 env(vec3 R){                                  // procedural studio: softbox above, horizon line, floor bounce
    float y = R.y;
    vec3 c = vec3(.07,.07,.08);
    c += vec3(.98,.98,1.) * smoothstep(.03,.28,y) * (1.-smoothstep(.55,.90,y));
    c += vec3(.30) * smoothstep(.90,1.,y);
    c += vec3(.36,.36,.40) * (1.-smoothstep(0.,.09,abs(y)));
    c += vec3(.22,.22,.25) * smoothstep(-.80,-.40,y) * (1.-smoothstep(-.32,-.10,y));
    c *= .92 + .08*R.x;
    return c;
  }
  // arc length along the pill edge, clockwise from the top-left tangent point (perimeter 1676.8)
  float ringS(vec2 p){
    if (p.x < 116.) { vec2 v = p - vec2(116.,116.); return 1312.4 + atan(-v.x, v.y)*116.; }
    if (p.x > 590.) { vec2 v = p - vec2(590.,116.); return 474. + atan(v.x, -v.y)*116.; }
    return p.y < 116. ? (p.x - 116.) : 838.4 + (590. - p.x);
  }
  float wrapd(float a, float b){ return mod(a - b + 838.4, 1676.8) - 838.4; }
  vec3 metal(vec2 p, float d, vec2 n, vec2 kp, float px, out float alpha){
    // a chrome tube of constant section; only its surface flows
    float T = 26.;
    alpha = 1. - smoothstep(T-px, T+px, d);
    if (alpha <= 0.) return vec3(0.);
    float u_ = clamp(2.*d/T - 1., -1., 1.);
    float hz = sqrt(max(0., 1.-u_*u_));               // half-round section
    float dh = -u_/max(hz,.12);
    float sA = ringS(p);
    float t = uTime * (1. + .15*uHover);              // always slow; hover barely hurries it
    // periodic flow along the ring: three harmonics at different speeds
    float k = 6.2832/1676.8;
    float a1 = k*3.*sA - t*.55, a2 = k*5.*sA + t*.42 + 1.7, a3 = k*8.*sA - t*.85 + 4.1;
    float flow = (sin(a1) + .7*sin(a2) + .5*sin(a3)) / 2.2;
    float dflow = (3.*cos(a1) + 3.5*cos(a2) + 4.*cos(a3)) * k / 2.2;
    // two mercury glints circulating in opposite directions
    float g1 = wrapd(sA, mod(t*105., 1676.8));          // one lap in ~16 s
    float g2 = wrapd(sA, mod(2200. - t*75., 1676.8));   // the other way, ~22 s
    float drop = exp(-g1*g1/1600.) + exp(-g2*g2/1600.);
    vec2 tau = vec2(-n.y, n.x);
    vec2 grad = dh*n*(.9 + .3*flow + .6*drop) + tau*dflow*34.;
    vec3 N = normalize(vec3(-grad.x, grad.y, 1.));    // lighting space is y-up
    vec3 V = vec3(0.,0.,1.);
    vec3 R = reflect(-V, N);
    vec3 c = env(R) * vec3(.96,.97,1.);
    c *= .90 + .18*flow;
    c += drop * .5 * hz*hz * mix(vec3(1.), vec3(1.,.78,.5), uHover);
    c += .16*pow(1.-N.z, 3.);                          // grazing fresnel
    c *= .55 + .45*smoothstep(0., 3., d);               // dark seam against the pill
    c += uHover * vec3(1.,.45,.12) * .22 * smoothstep(200.,70.,length(kp)) * (.4+.6*hz);
    return c;
  }

  vec3 crystal(vec2 kp, float kr, float px, vec3 under){
    vec2 q = kp/88.;
    float t = q.y*.5+.5;                                  // 0 top -> 1 bottom of the well
    float rw = kr/88.;
    vec3 well = vec3(mix(.34,.60,t));
    well *= 1. - .40*smoothstep(.70,1.,rw)*(1.-t);        // inner shadow under the top lip
    well += .28*smoothstep(.90,.985,rw)*t;                // lit bottom lip
    float R = 80.; float rs = kr/R;
    well *= 1. - .35*smoothstep(R+7., R, kr);             // contact shadow around the sphere
    float sph = 1. - smoothstep(R-px, R+px, kr);
    if (sph <= 0.) return well;
    float z = sqrt(max(0., 1.-rs*rs));
    vec3 N = vec3(q.x*88./R, -q.y*88./R, z);              // y up
    vec3 V = vec3(0.,0.,1.);
    float fres = pow(1.-z, 2.6);
    // refracted lookup into the shard field
    vec3 Rf = refract(-V, N, 1./1.5);
    vec2 uv = N.xy*.5 + Rf.xy*1.1 + vec2(uTime*.02, -uTime*.013);
    vec3 vr = voro(uv*3.0);
    float facet = 1. - smoothstep(0., .14, vr.y - vr.x);  // shard boundaries
    float shard = .7 + .3*vr.z;
    float mott = fbm(uv*4.);
    // transparent glass: the dark well shows through, refracted, with bright shard edges
    float tr = clamp(.5 - (q.y + Rf.y*.8)*.5, 0., 1.);
    vec3 floorC = vec3(mix(.16,.34,tr)) * (.85+.3*mott);
    vec3 glass = mix(floorC, vec3(.62,.66,.80), .22*shard + .18*(1.-z)) * (.8+.2*z);
    float depth = pow(rs, 1.5);
    vec3 core = mix(vec3(.26,.05,0.), vec3(.95,.36,.03), depth) * (.75+.5*shard);
    core = mix(core, vec3(1.,.66,.22), smoothstep(.5,1.,rs)*smoothstep(-.1,.9,-N.y));   // amber pooling at the bottom
    vec3 interior = mix(glass, core, uHover);
    interior += facet * mix(vec3(.80,.84,1.)*(.55+.45*z), vec3(1.,.70,.35)*.6, uHover);
    float pt = smoothstep(.10, 0., vr.x) * (.5+.5*sin(uTime*2.+vr.z*40.));
    interior += pt * mix(vec3(.9,.92,1.), vec3(1.,.92,.75), uHover) * (.55+.45*uHover);
    // lighting
    vec3 L1 = normalize(vec3(-.45,.75,.5));
    float blob = smoothstep(.72,.985, dot(N, normalize(vec3(-.18,.72,.67))));
    float spec = pow(max(dot(reflect(-L1,N),V),0.), 90.);
    vec3 rimCol = mix(vec3(.96,.96,1.), vec3(1.,.72,.40), uHover);
    vec3 c = interior*(1.-.45*fres) + rimCol*fres*.9;
    c += blob*.42*(1.-.5*uHover) + spec*.9;
    float glint = smoothstep(.55,1.,rs) * smoothstep(.15,1.,-N.y);
    c += mix(vec3(.78,.74,.92), vec3(1.,.50,.12), uHover) * glint * .55;
    return mix(well, c, sph);
  }

  void main(){
    vec2 p = vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y) / uU - vec2(48.);
    float px = 1./uU;
    vec2 c = vec2(clamp(p.x,116.,590.),116.);
    vec2 dv = p - c; float dist = length(dv);
    float d = dist - 116.;
    vec2 kp = p - vec2(590.,116.); float kr = length(kp);
    float cover = 1. - smoothstep(-px, px, d);
    if (cover <= .001){
      float ma; vec3 mc = metal(p, d, dv/max(dist,1e-4), kp, px, ma);
      fragColor = vec4(mc*ma, ma); return;
    }
    float inside = -d;
    vec2 n = dist > 0. ? dv/dist : vec2(0.,-1.);
    float lit = -n.y;                                     // 1 on the top edge
    float base = tone(p.y) * (1. + .05*(fbm(p*.03)-.5));
    float k = .42 - .22*lit, w = 34. - 10.*lit;
    float f = pow(max(0., 1.-(inside-2.5)/w), 1.25);
    float L = base * (1. - k*f);
    float rim = 1. - smoothstep(2.0, 3.2, inside);
    L = mix(L, .34, rim);
    // fleck noise: 2-unit cells, soft round dots, denser lower down
    vec2 cell = floor(p*.5); vec2 fc = fract(p*.5)-.5;
    float dotm = smoothstep(.72,.22,length(fc));
    float h1=hash21(cell), h2=hash21(cell+11.3), h3=hash21(cell+23.7), h4=hash21(cell+37.1);
    float envD = .15 + .85*smoothstep(.05,.40,p.y/232.);
    float fleck = step(h1,.42) * (.25+.55*h2) * dotm * envD;
    L *= 1. - .30*fleck;
    // mica sparkle, twinkling
    float tw = .6 + .4*sin(uTime*(.8+1.6*h3) + h4*6.2832);
    float spark = step(h3,.10) * h2*h2 * dotm * tw;
    L += .38*spark*(.5+.5*smoothstep(.1,.5,p.y/232.));
    // pointer scratches: hairline grooves lit from above (dark upper wall, bright lower wall)
    vec2 tc = gl_FragCoord.xy / uRes;
    float s0 = texture(uScratch, tc).r;
    float sU = texture(uScratch, tc + vec2(0., 1./uRes.y)).r;
    float sD = texture(uScratch, tc - vec2(0., 1./uRes.y)).r;
    L += (.58*(sU - sD) - .05*s0) * (1.-rim);
    vec3 col = vec3(L);
    col += uHover * vec3(1.,.45,.10) * .22 * smoothstep(175.,88.,kr) * (1.-rim);   // warm spill on the body
    float wellA = 1. - smoothstep(88.-px, 88.+px, kr);
    if (wellA > 0.) col = mix(col, crystal(kp, kr, px, col), wellA);
    if (cover < .999){ float ma; vec3 mc = metal(p, max(d,0.), dv/max(dist,1e-4), kp, px, ma); col = mix(mc, col, cover); cover = max(cover, ma); }
    fragColor = vec4(col*cover, cover);
  }`;
const PTS_VS = `#version 300 es
  in vec4 aSeed;
  uniform vec2 uRes; uniform float uU, uTime, uHover;
  out float vA; out vec3 vCol;
  void main(){
    float s0=aSeed.x, s1=aSeed.y, s2=aSeed.z, s3=aSeed.w;
    float speed = (.10 + .30*s3) * (1. + 2.*uHover);
    float t = uTime*speed + s0*6.2832;
    float rad = .18 + .72*s1;
    float tilt = s2*3.1416, yaw = s3*6.2832;
    vec3 pl = vec3(cos(t), 0., sin(t)) * rad;
    vec3 p1 = vec3(pl.x, pl.y*cos(tilt)-pl.z*sin(tilt), pl.y*sin(tilt)+pl.z*cos(tilt));
    vec3 p = vec3(p1.x*cos(yaw)+p1.z*sin(yaw), p1.y, -p1.x*sin(yaw)+p1.z*cos(yaw));
    // on hover a few embers drift up out of the crystal and fade
    float esc = step(.74, s1) * uHover;
    float rise = fract(uTime*.22 + s0);
    p.y += esc * rise * 1.9; p.x += esc * sin(rise*9. + s2*6.) * .18 * rise;
    float fade = 1. - esc*smoothstep(.5, 1., rise);
    vec2 ref = vec2(590.,116.) + vec2(p.x, -p.y) * 80. + vec2(48.);
    vec2 px = ref * uU; px.y = uRes.y - px.y;
    gl_Position = vec4(px/uRes*2.-1., 0., 1.);
    float depth = p.z*.5+.5;
    gl_PointSize = max(1., (1.5 + 2.8*s2) * uU * (.55+.55*depth));
    float tw = .6 + .4*sin(uTime*(1.+2.*s2) + s1*6.28);
    vA = (.42 + .58*uHover) * (.3 + .7*depth) * tw * fade;
    vCol = mix(vec3(.80,.82,.95), vec3(1.,.66,.28), uHover);
  }`;
const LINE_VS = `#version 300 es
  in vec2 aP; in float aW; uniform vec2 uRes; uniform float uU; out float vW;
  void main(){ vec2 px = (aP + vec2(48.)) * uU; px.y = uRes.y - px.y; gl_Position = vec4(px/uRes*2.-1., 0., 1.); vW = aW; }`;
const LINE_FS = `#version 300 es
  precision mediump float; in float vW; out vec4 o; void main(){ o = vec4(vW); }`;
const FADE_FS = `#version 300 es
  precision mediump float; uniform float uFade; out vec4 o; void main(){ o = vec4(uFade); }`;
const PTS_FS = `#version 300 es
  precision mediump float; in float vA; in vec3 vCol; out vec4 o;
  void main(){ float d=length(gl_PointCoord-.5)*2.; float a=smoothstep(1.,.12,d); a*=a*vA; o=vec4(vCol*a, a); }`;
export const LiquidChromeButton = React.forwardRef<HTMLButtonElement, LiquidChromeButtonProps>(
  (
    {
      label = 'RESOURCES',
      height = 32,
      className,
      title = 'Collegiate Learning Resources & Compilers (Opens in new tab)',
      onClick,
      style,
      ...rest
    },
    ref
  ) => {
    const ctaRef = useRef<HTMLButtonElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const clockRef = useRef<HTMLSpanElement | null>(null);

    useEffect(() => {
      const cta = ctaRef.current;
      const cv = canvasRef.current;
      const clock = clockRef.current;
      if (!cta || !cv || !clock) return;

      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const gl = cv.getContext('webgl2', {
        alpha: true,
        premultipliedAlpha: true,
        antialias: false,
        powerPreference: 'low-power',
      });

      if (!gl) {
        cta.classList.add('no-gl');
        return;
      }

      const compile = (type: number, src: string) => {
        const s = gl.createShader(type);
        if (!s) throw new Error('Failed to create shader');
        gl.shaderSource(s, src);
        gl.compileShader(s);
        if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
          const err = gl.getShaderInfoLog(s);
          gl.deleteShader(s);
          throw new Error(err || 'Shader compile error');
        }
        return s;
      };

      const program = (vs: string, fs: string) => {
        const p = gl.createProgram();
        if (!p) throw new Error('Failed to create program');
        const vShader = compile(gl.VERTEX_SHADER, vs);
        const fShader = compile(gl.FRAGMENT_SHADER, fs);
        gl.attachShader(p, vShader);
        gl.attachShader(p, fShader);
        gl.linkProgram(p);
        if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
          const err = gl.getProgramInfoLog(p);
          gl.deleteProgram(p);
          throw new Error(err || 'Program link error');
        }
        gl.deleteShader(vShader);
        gl.deleteShader(fShader);
        return p;
      };

      let face: WebGLProgram | null = null;
      let pts: WebGLProgram | null = null;
      let lineP: WebGLProgram | null = null;
      let fadeP: WebGLProgram | null = null;
      const U: Record<string, WebGLUniformLocation | null> = {};
      let vaoQuad: WebGLVertexArrayObject | null = null;
      let vaoPts: WebGLVertexArrayObject | null = null;
      let vaoLine: WebGLVertexArrayObject | null = null;
      let qb: WebGLBuffer | null = null;
      let pb: WebGLBuffer | null = null;
      let lb: WebGLBuffer | null = null;
      const N_PTS = 180;

      try {
        face = program(QUAD_VS, FACE_FS);
        pts = program(PTS_VS, PTS_FS);
        lineP = program(LINE_VS, LINE_FS);
        fadeP = program(QUAD_VS, FADE_FS);
      } catch (e) {
        console.error('LiquidChromeButton WebGL init error:', e);
        cta.classList.add('no-gl');
        return;
      }

      for (const k of ['uRes', 'uU', 'uTime', 'uHover']) {
        U['f_' + k] = gl.getUniformLocation(face, k);
        U['p_' + k] = gl.getUniformLocation(pts, k);
      }
      U.f_uScratch = gl.getUniformLocation(face, 'uScratch');
      U.l_uRes = gl.getUniformLocation(lineP, 'uRes');
      U.l_uU = gl.getUniformLocation(lineP, 'uU');
      U.fade = gl.getUniformLocation(fadeP, 'uFade');

      vaoQuad = gl.createVertexArray();
      gl.bindVertexArray(vaoQuad);
      qb = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, qb);
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
        gl.STATIC_DRAW
      );
      const aPos = gl.getAttribLocation(face, 'aPos');
      if (aPos >= 0) {
        gl.enableVertexAttribArray(aPos);
        gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);
      }

      vaoPts = gl.createVertexArray();
      gl.bindVertexArray(vaoPts);
      const seeds = new Float32Array(N_PTS * 4);
      let s = 0x2545f491;
      const rnd = () => {
        s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
        return s / 4294967296;
      };
      for (let i = 0; i < seeds.length; i++) seeds[i] = rnd();
      pb = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, pb);
      gl.bufferData(gl.ARRAY_BUFFER, seeds, gl.STATIC_DRAW);
      const aSeed = gl.getAttribLocation(pts, 'aSeed');
      if (aSeed >= 0) {
        gl.enableVertexAttribArray(aSeed);
        gl.vertexAttribPointer(aSeed, 4, gl.FLOAT, false, 0, 0);
      }

      vaoLine = gl.createVertexArray();
      gl.bindVertexArray(vaoLine);
      lb = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, lb);
      gl.bufferData(gl.ARRAY_BUFFER, 6 * 1024 * 4, gl.DYNAMIC_DRAW);
      const aP = gl.getAttribLocation(lineP, 'aP');
      const aW = gl.getAttribLocation(lineP, 'aW');
      if (aP >= 0) {
        gl.enableVertexAttribArray(aP);
        gl.vertexAttribPointer(aP, 2, gl.FLOAT, false, 12, 0);
      }
      if (aW >= 0) {
        gl.enableVertexAttribArray(aW);
        gl.vertexAttribPointer(aW, 1, gl.FLOAT, false, 12, 8);
      }
      gl.bindVertexArray(null);

      let scratchTex: WebGLTexture | null = null;
      let fbo: WebGLFramebuffer | null = null;

      function makeScratchMap(w: number, h: number) {
        if (!gl) return;
        if (scratchTex) {
          gl.deleteTexture(scratchTex);
          gl.deleteFramebuffer(fbo);
        }
        scratchTex = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, scratchTex);
        gl.texImage2D(
          gl.TEXTURE_2D,
          0,
          gl.RGBA,
          w,
          h,
          0,
          gl.RGBA,
          gl.UNSIGNED_BYTE,
          null
        );
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        fbo = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
        gl.framebufferTexture2D(
          gl.FRAMEBUFFER,
          gl.COLOR_ATTACHMENT0,
          gl.TEXTURE_2D,
          scratchTex,
          0
        );
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      }

      const segs: number[] = [];
      let prev: { x: number; y: number } | null = null;

      const onPointerMove = (e: PointerEvent) => {
        const r = cta.getBoundingClientRect();
        if (r.width <= 0) return;
        const u = r.width / 706;
        const x = (e.clientX - r.left) / u;
        const y = (e.clientY - r.top) / u;
        if (!prev) {
          prev = { x, y };
          return;
        }
        const dx = x - prev.x;
        const dy = y - prev.y;
        const len = Math.hypot(dx, dy);
        if (len < 0.8) return;
        const tx = dx / len;
        const ty = dy / len;
        const nx = -ty;
        const ny = tx;
        for (let i = 0; i < 3; i++) {
          const o = (rnd() - 0.5) * 5;
          const w = 0.3 + 0.35 * rnd();
          const j0 = rnd() * 0.3 * len;
          const j1 = rnd() * 0.3 * len;
          segs.push(
            prev.x + nx * o + tx * j0,
            prev.y + ny * o + ty * j0,
            w,
            x + nx * o - tx * j1,
            y + ny * o - ty * j1,
            w
          );
        }
        if (segs.length > 6 * 1000) segs.splice(0, segs.length - 6 * 1000);
        prev = { x, y };
      };

      const onPointerLeave = () => {
        prev = null;
      };

      cta.addEventListener('pointermove', onPointerMove);
      cta.addEventListener('pointerleave', onPointerLeave);

      let W = 0;
      let H = 0;
      let lastTick = 0;
      let raf = 0;

      function resize() {
        if (!gl || !cv || !cta) return false;
        const r = cta.getBoundingClientRect();
        if (r.width <= 0 || r.height <= 0) return false;
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const u = r.width / 706;
        const w = Math.round((706 + 96) * u * dpr);
        const h = Math.round((232 + 96) * u * dpr);
        if (w < 4 || h < 4) return false;
        if (w !== W || h !== H) {
          W = w;
          H = h;
          cv.width = W;
          cv.height = H;
          makeScratchMap(W, H);
        }
        return true;
      }

      function render(now: number) {
        if (!gl || !resize() || !face || !pts || !lineP || !fadeP || !clock) return;
        const hover = parseFloat(window.getComputedStyle(clock).opacity) || 0;
        const t = reduced ? 0 : now / 1000;
        gl.viewport(0, 0, W, H);

        // 1. scratch map: fade a touch, then add this frame's strokes
        gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
        gl.enable(gl.BLEND);
        gl.blendEquation(gl.FUNC_REVERSE_SUBTRACT);
        gl.blendFunc(gl.ONE, gl.ONE);
        gl.useProgram(fadeP);
        if (U.fade) gl.uniform1f(U.fade, 1.25 / 255);
        gl.bindVertexArray(vaoQuad);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        gl.blendEquation(gl.FUNC_ADD);
        if (segs.length && lb) {
          gl.useProgram(lineP);
          if (U.l_uRes) gl.uniform2f(U.l_uRes, W, H);
          if (U.l_uU) gl.uniform1f(U.l_uU, W / 802);
          gl.bindVertexArray(vaoLine);
          gl.bindBuffer(gl.ARRAY_BUFFER, lb);
          gl.bufferSubData(gl.ARRAY_BUFFER, 0, new Float32Array(segs));
          gl.drawArrays(gl.LINES, 0, segs.length / 3);
          segs.length = 0;
        }
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);

        // 2. face + crystal
        gl.disable(gl.BLEND);
        gl.useProgram(face);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, scratchTex);
        if (U.f_uScratch) gl.uniform1i(U.f_uScratch, 0);
        if (U.f_uRes) gl.uniform2f(U.f_uRes, W, H);
        if (U.f_uU) gl.uniform1f(U.f_uU, W / 802);
        if (U.f_uTime) gl.uniform1f(U.f_uTime, t);
        if (U.f_uHover) gl.uniform1f(U.f_uHover, hover);
        gl.bindVertexArray(vaoQuad);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

        // 3. particles
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.ONE, gl.ONE);
        gl.useProgram(pts);
        if (U.p_uRes) gl.uniform2f(U.p_uRes, W, H);
        if (U.p_uU) gl.uniform1f(U.p_uU, W / 802);
        if (U.p_uTime) gl.uniform1f(U.p_uTime, t);
        if (U.p_uHover) gl.uniform1f(U.p_uHover, hover);
        gl.bindVertexArray(vaoPts);
        gl.drawArrays(gl.POINTS, 0, N_PTS);
        gl.bindVertexArray(null);

        lastTick = performance.now();
      }

      const loop = (now: number) => {
        raf = requestAnimationFrame(loop);
        render(now);
      };

      render(performance.now());
      raf = requestAnimationFrame(loop);

      const watchdog = setInterval(() => {
        if (performance.now() - lastTick > 400) {
          render(performance.now());
        }
      }, 500);

      const onWindowResize = () => render(performance.now());
      const onVisibilityChange = () => render(performance.now());
      const onContextLost = (e: Event) => {
        e.preventDefault();
        cancelAnimationFrame(raf);
        cta.classList.add('no-gl');
      };

      window.addEventListener('resize', onWindowResize);
      document.addEventListener('visibilitychange', onVisibilityChange);
      cv.addEventListener('webglcontextlost', onContextLost);

      return () => {
        cancelAnimationFrame(raf);
        clearInterval(watchdog);
        window.removeEventListener('resize', onWindowResize);
        document.removeEventListener('visibilitychange', onVisibilityChange);
        cv.removeEventListener('webglcontextlost', onContextLost);
        cta.removeEventListener('pointermove', onPointerMove);
        cta.removeEventListener('pointerleave', onPointerLeave);

        if (gl) {
          if (scratchTex) gl.deleteTexture(scratchTex);
          if (fbo) gl.deleteFramebuffer(fbo);
          if (qb) gl.deleteBuffer(qb);
          if (pb) gl.deleteBuffer(pb);
          if (lb) gl.deleteBuffer(lb);
          if (vaoQuad) gl.deleteVertexArray(vaoQuad);
          if (vaoPts) gl.deleteVertexArray(vaoPts);
          if (vaoLine) gl.deleteVertexArray(vaoLine);
          if (face) gl.deleteProgram(face);
          if (pts) gl.deleteProgram(pts);
          if (lineP) gl.deleteProgram(lineP);
          if (fadeP) gl.deleteProgram(fadeP);
        }
      };
    }, []);

    return (
      <button
        ref={(node) => {
          ctaRef.current = node;
          if (typeof ref === 'function') ref(node);
          else if (ref) (ref as React.MutableRefObject<HTMLButtonElement | null>).current = node;
        }}
        type="button"
        aria-label={label || 'Resources'}
        title={title}
        onClick={onClick}
        style={{
          ...style,
          ...(height ? ({ '--btn-h': `${height}px` } as React.CSSProperties) : {}),
        }}
        className={clsx('liquid-chrome-btn', className)}
        {...rest}
      >
        <span className="lcb-halo" aria-hidden="true" />
        <span className="lcb-face" aria-hidden="true">
          <canvas ref={canvasRef} />
        </span>
        <span className="lcb-knob-fallback" aria-hidden="true" />
        <span className="lcb-label" aria-hidden="true">
          {label}
        </span>
        <span className="lcb-knob" aria-hidden="true">
          <span ref={clockRef} className="lcb-glow" />
          <svg className="lcb-pen" viewBox="0 0 176 176">
            <path className="lcb-scribble" d="M63 108q5-5 10 0t10 0t10 0" />
            <g className="lcb-pen-move">
              <g className="lcb-pen-wiggle">
                <path
                  className="lcb-pen-body"
                  d="M106.1 77.4a3.8 3.8 0 0 0-15.1-15.1L70.3 82.9a7.6 7.6 0 0 0-1.9 3.2l-5 16.5a1.9 1.9 0 0 0 2.4 2.4l16.5-5a7.6 7.6 0 0 0 3.2-1.9z"
                />
                <path className="lcb-pen-body" d="M85.1 68.4l7.6 7.6" />
              </g>
            </g>
          </svg>
        </span>
      </button>
    );
  }
);

LiquidChromeButton.displayName = 'LiquidChromeButton';
export default LiquidChromeButton;
