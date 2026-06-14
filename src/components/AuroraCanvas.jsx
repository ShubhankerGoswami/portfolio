/**
 * AuroraCanvas — WebGL fluid aurora background.
 * Domain-warped FBM noise (Inigo Quilez technique) rendered at low opacity
 * behind the orb section. Shifts palette with voice phase.
 * Zero dependencies, fills its parent via ResizeObserver.
 */
import { useEffect, useRef } from 'react'

const PHASE_MAP = { idle: 0, listening: 1, processing: 2, speaking: 3 }

const VERT = `attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}`

// Domain-warped fluid noise — f(p + f(p + f(p)))
const FRAG = `
precision mediump float;
uniform vec2  R;
uniform float T;
uniform float P;  /* smoothed phase 0-3 */

float h(vec2 p){p=fract(p*vec2(443.897,441.423));p+=dot(p,p+19.19);return fract(p.x*p.y);}
float n(vec2 p){
  vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
  return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);
}
float fbm(vec2 p){
  float v=0.,a=.5;
  for(int i=0;i<4;i++){v+=a*n(p);p=p*2.1+vec2(5.3,1.7);a*=.5;}
  return v;
}

void main(){
  vec2 uv=gl_FragCoord.xy/R;
  float t=T*.10;

  /* Classic domain warp: f(p + f(p + f(p))) */
  vec2 q=vec2(fbm(uv+t), fbm(uv+1.));
  vec2 r=vec2(
    fbm(uv+q+vec2(1.7,9.2)+.15*t),
    fbm(uv+q+vec2(8.3,2.8)+.126*t));
  float f=fbm(uv+r);

  /* Per-phase palettes (two colours, blended by f) */
  vec3 a1=vec3(.25,.04,.52), a2=vec3(.04,.16,.62);  /* idle: indigo-blue */
  vec3 b1=vec3(.02,.42,.22), b2=vec3(0.,.25,.52);   /* listening: emerald */
  vec3 c1=vec3(.04,.22,.70), c2=vec3(.32,.04,.68);  /* processing: electric blue */
  vec3 d1=vec3(.50,.04,.70), d2=vec3(.70,.06,.42);  /* speaking: violet-rose */

  /* Smooth interpolation across phases */
  vec3 col1,col2;
  if(P<1.)      {col1=mix(a1,b1,P);      col2=mix(a2,b2,P);}
  else if(P<2.) {col1=mix(b1,c1,P-1.);   col2=mix(b2,c2,P-1.);}
  else          {col1=mix(c1,d1,P-2.);   col2=mix(c2,d2,P-2.);}

  f=clamp(f*f*2.8, 0., 1.);
  vec3 col=mix(col1, col2, f);

  /* Very low opacity — this is atmosphere, not foreground */
  float alpha=0.20*f;
  gl_FragColor=vec4(col, alpha);
}
`

export default function AuroraCanvas({ phase = 'idle' }) {
  const ref   = useRef(null)
  const state = useRef({ gl: null, prog: null, locs: {}, raf: null, t0: 0, cur: 0, tgt: 0 })

  useEffect(() => { state.current.tgt = PHASE_MAP[phase] ?? 0 }, [phase])

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const parent = canvas.parentElement
    if (!parent) return

    // Size canvas to match parent, update on resize
    const resize = () => {
      const w = parent.clientWidth, h = parent.clientHeight
      if (!w || !h) return
      canvas.width = w; canvas.height = h
      const S = state.current
      if (S.gl) {
        S.gl.viewport(0, 0, w, h)
        if (S.locs.R) S.gl.uniform2f(S.locs.R, w, h)
      }
    }
    const ro = new ResizeObserver(resize)
    ro.observe(parent)
    resize()

    const g =
      canvas.getContext('webgl', { alpha: true, premultipliedAlpha: false }) ||
      canvas.getContext('experimental-webgl', { alpha: true })
    if (!g) { ro.disconnect(); return }

    const mkS = (type, src) => {
      const s = g.createShader(type); g.shaderSource(s, src); g.compileShader(s); return s
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
    g.uniform2f(locs.R, canvas.width, canvas.height)

    const S = state.current
    S.gl = g; S.prog = prog; S.locs = locs; S.t0 = performance.now()

    const draw = () => {
      if (!ref.current) return
      S.cur += (S.tgt - S.cur) * 0.03   // slower lerp for ambient background
      const t = (performance.now() - S.t0) / 1000
      const w = canvas.width, h = canvas.height
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
      ro.disconnect()
      S.gl = null
    }
  }, [])

  return (
    <canvas
      ref={ref}
      style={{
        position: 'absolute', inset: 0,
        width: '100%', height: '100%',
        pointerEvents: 'none',
      }}
    />
  )
}
