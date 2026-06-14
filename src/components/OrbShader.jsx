/**
 * OrbShader — WebGL fragment-shader orb.
 * Renders a 3D-lit sphere with flowing FBM noise, Fresnel iridescence,
 * and smooth phase transitions (idle → listening → processing → speaking).
 * Zero external dependencies, ~0 KB bundle overhead.
 */
import { useEffect, useRef, useState } from 'react'

const PHASE_MAP = { idle: 0, listening: 1, processing: 2, speaking: 3 }

const VERT = `attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}`

// Full fragment shader — sphere + 3D lighting + FBM noise + Fresnel iridescence
const FRAG = `
precision highp float;
uniform vec2  R;   /* canvas resolution */
uniform float T;   /* time in seconds   */
uniform float P;   /* phase 0-3 smooth  */

/* ── Noise ──────────────────────────────────────────────────────────── */
float h(vec2 p){p=fract(p*vec2(443.897,441.423));p+=dot(p,p+19.19);return fract(p.x*p.y);}
float n(vec2 p){
  vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
  return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);
}
float fbm(vec2 p){
  float v=0.,a=.5;
  mat2 m=mat2(1.6,1.2,-1.2,1.6);
  for(int i=0;i<4;i++){v+=a*n(p);p=m*p;a*=.5;}
  return v;
}

/* ── Inigo Quilez cosine palette ────────────────────────────────────── */
vec3 pal(float t,vec3 a,vec3 b,vec3 c,vec3 d){return a+b*cos(6.2832*(c*t+d));}

void main(){
  /* Normalised coords: centre = 0, radius = 1 */
  vec2 uv=(gl_FragCoord.xy*2.-R)/min(R.x,R.y);
  float r=length(uv);
  if(r>1.04){gl_FragColor=vec4(0);return;}

  /* ── 3-D sphere geometry ─────────────────────────────────────────── */
  float z=sqrt(max(0.,1.-r*r));
  vec3 N=normalize(vec3(uv,z));
  vec3 V=vec3(0,0,1);
  vec3 L=normalize(vec3(.55,.75,1.));

  float diff = max(dot(N,L),0.)*.78+.22;
  float spec = pow(max(dot(reflect(-L,N),V),0.),64.);
  float fr   = pow(1.-max(dot(N,V),0.),2.8);   /* Fresnel angle */

  /* ── Flowing noise (speed + distortion driven by phase) ─────────── */
  float spd=.18+P*.40;
  vec2 p=uv*2.;
  p += vec2(fbm(p*.75+T*.11), fbm(p*.75+vec2(4.7,2.3))) * (.14+P*.10);
  float nf = fbm(p+T*spd)*.65 + fbm(p*1.9-T*spd*.55+5.5)*.35;

  /* ── Phase colour palettes ───────────────────────────────────────── */
  /* idle: deep indigo-violet */
  vec3 c0=pal(nf,vec3(.32,.06,.62),vec3(.22,.12,.28),vec3(1.,.9,.8),vec3(0.,.15,.32));
  /* listening: emerald-teal */
  vec3 c1=pal(nf,vec3(.02,.50,.32),vec3(.08,.36,.18),vec3(1.,.8,.9),vec3(.12,.28,.45));
  /* processing: electric blue */
  vec3 c2=pal(nf,vec3(.05,.22,.76),vec3(.18,.24,.42),vec3(.9,.8,1.),vec3(.30,0.,.15));
  /* speaking: violet-magenta */
  vec3 c3=pal(nf,vec3(.55,.06,.68),vec3(.33,.08,.28),vec3(.9,1.,.8),vec3(0.,.22,.50));

  /* Smooth linear interpolation across phases */
  vec3 col;
  if(P<1.)      col=mix(c0,c1,P);
  else if(P<2.) col=mix(c1,c2,P-1.);
  else          col=mix(c2,c3,P-2.);

  /* ── Lighting ────────────────────────────────────────────────────── */
  col *= diff;
  col += spec * .55 * vec3(.90,.88,1.);

  /* ── Iridescent Fresnel rim (hue shifts over time) ──────────────── */
  vec3 iri=pal(fract(T*.06+r*.40),vec3(.5),vec3(.5),vec3(1.,.8,.6),vec3(0.,.2,.5));
  col=mix(col, col*.45+iri, fr*.55);

  /* ── Subtle centre glow ─────────────────────────────────────────── */
  col += (0.85-r)*.13*col;

  /* ── Alpha: hard circle with feathered edge ─────────────────────── */
  float alpha=smoothstep(1.04,.86,r);
  gl_FragColor=vec4(col,alpha);
}
`

export default function OrbShader({ phase = 'idle', size = 140 }) {
  const ref   = useRef(null)
  const state = useRef({ gl: null, prog: null, locs: {}, raf: null, t0: 0, cur: 0, tgt: 0 })
  const [noGL, setNoGL] = useState(false)

  // Keep target phase in sync without triggering re-renders
  useEffect(() => { state.current.tgt = PHASE_MAP[phase] ?? 0 }, [phase])

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const w = size * dpr, h = size * dpr
    canvas.width = w; canvas.height = h

    const g =
      canvas.getContext('webgl', { alpha: true, premultipliedAlpha: false, antialias: true }) ||
      canvas.getContext('experimental-webgl', { alpha: true })
    if (!g) { setNoGL(true); return }

    const mkS = (type, src) => {
      const s = g.createShader(type)
      g.shaderSource(s, src); g.compileShader(s)
      if (!g.getShaderParameter(s, g.COMPILE_STATUS)) console.warn('[OrbShader]', g.getShaderInfoLog(s))
      return s
    }
    const prog = g.createProgram()
    g.attachShader(prog, mkS(g.VERTEX_SHADER, VERT))
    g.attachShader(prog, mkS(g.FRAGMENT_SHADER, FRAG))
    g.linkProgram(prog); g.useProgram(prog)

    const buf = g.createBuffer()
    g.bindBuffer(g.ARRAY_BUFFER, buf)
    g.bufferData(g.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,1,1]), g.STATIC_DRAW)
    const aLoc = g.getAttribLocation(prog, 'a')
    g.enableVertexAttribArray(aLoc)
    g.vertexAttribPointer(aLoc, 2, g.FLOAT, false, 0, 0)

    g.enable(g.BLEND)
    g.blendFunc(g.SRC_ALPHA, g.ONE_MINUS_SRC_ALPHA)

    const locs = {
      R: g.getUniformLocation(prog, 'R'),
      T: g.getUniformLocation(prog, 'T'),
      P: g.getUniformLocation(prog, 'P'),
    }
    g.uniform2f(locs.R, w, h)

    const S = state.current
    S.gl = g; S.prog = prog; S.locs = locs; S.t0 = performance.now()

    const draw = () => {
      S.cur += (S.tgt - S.cur) * 0.05   // smooth lerp toward target phase
      const t = (performance.now() - S.t0) / 1000
      g.viewport(0, 0, w, h)
      g.clearColor(0, 0, 0, 0); g.clear(g.COLOR_BUFFER_BIT)
      g.uniform1f(locs.T, t)
      g.uniform1f(locs.P, S.cur)
      g.drawArrays(g.TRIANGLE_STRIP, 0, 4)
      S.raf = requestAnimationFrame(draw)
    }
    draw()

    return () => {
      cancelAnimationFrame(S.raf)
      g.deleteProgram(prog)
      S.gl = null
    }
  }, [size])

  if (noGL) return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: 'radial-gradient(circle at 38% 38%, hsl(258,60%,55%), hsl(240,70%,22%))',
    }} />
  )

  return (
    <canvas
      ref={ref}
      style={{ width: size, height: size, borderRadius: '50%', display: 'block' }}
    />
  )
}
