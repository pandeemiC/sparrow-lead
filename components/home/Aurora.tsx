"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

export type AuroraControl = { pulse: () => void };

// red aurora curtains drawn with a fragment shader.
// uT = time, uP = brightness pulse (a hot signal arrived), uG = overall gain,
// uY = where the curtain sits vertically (0 bottom, 1 top)
const FRAGMENT = `precision mediump float;
uniform vec2 uR;uniform float uT,uP,uG,uY;
float hs(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}
float ns(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hs(i),hs(i+vec2(1,0)),f.x),mix(hs(i+vec2(0,1)),hs(i+vec2(1,1)),f.x),f.y);}
float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<4;i++){v+=a*ns(p);p=p*2.03+7.1;a*=.5;}return v;}
void main(){
  vec2 uv=gl_FragCoord.xy/uR;float asp=uR.x/uR.y;vec2 p=vec2((uv.x-.5)*asp,uv.y);
  vec3 col=vec3(0.);
  for(int i=0;i<3;i++){float fi=float(i);
    float base=uY+.09*sin(p.x*1.1+uT*.07+fi*2.1)+.05*sin(p.x*2.6-uT*.05+fi)+.08*(fbm(vec2(p.x*.7+fi*3.,uT*.03))-.5)+fi*.06;
    float d=p.y-base;
    float ray=fbm(vec2(p.x*(6.+fi*2.)+fi*11.+sin(p.y*2.+uT*.1)*.25,uT*.04+fi));ray=smoothstep(.3,.85,ray);
    float up=smoothstep(-.02,.015,d)*exp(-max(d,0.)*(2.4+fi*.8));
    float edge=exp(-abs(d)*38.)*.55;
    float a=(up*ray*1.5+edge*ray*1.2+up*.12)*(1.-fi*.28);
    vec3 c=mix(vec3(1.,.16,.24),vec3(.45,.04,.1),clamp(d*2.,0.,1.));c=mix(c,vec3(1.,.6,.55),clamp(edge*ray,0.,1.)*.7);
    col+=c*a;
  }
  col*=.62*uG*(1.+uP*.9);
  col+=vec3(.45,.03,.07)*exp(-pow(length((uv-vec2(.5,uY+.12))*vec2(.9,2.2)),2.)*2.5)*.4*uG*(1.+uP*.5);
  float s=hs(floor(gl_FragCoord.xy));col+=vec3(1.,.85,.85)*step(.9975,s)*(.35+.35*sin(uT*1.5+s*90.))*smoothstep(.45,.95,uv.y)*.5;
  col=1.-exp(-col*1.5);col+=vec3(.043,.024,.027);col+=(hs(gl_FragCoord.xy+fract(uT))-.5)/255.;
  gl_FragColor=vec4(col,1.);
}`;

const VERTEX = "attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}";

export default function Aurora({
  y = 0.5,
  gain = 1,
  seed = 1,
  className,
  controlRef,
}: {
  y?: number;
  gain?: number;
  seed?: number;
  className?: string;
  controlRef?: React.RefObject<AuroraControl | null>;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl", {
      antialias: false,
      premultipliedAlpha: false,
    });
    if (!gl) return;

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const state = { t: ((Math.sin(seed * 127.1) + 1) / 2) * 100, p: 0 };

    const shader = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    };
    const program = gl.createProgram()!;
    gl.attachShader(program, shader(gl.VERTEX_SHADER, VERTEX));
    gl.attachShader(program, shader(gl.FRAGMENT_SHADER, FRAGMENT));
    gl.linkProgram(program);
    gl.useProgram(program);

    // one big triangle that covers the screen
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 3, -1, -1, 3]),
      gl.STATIC_DRAW,
    );
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

    const u = {
      R: gl.getUniformLocation(program, "uR"),
      T: gl.getUniformLocation(program, "uT"),
      P: gl.getUniformLocation(program, "uP"),
      G: gl.getUniformLocation(program, "uG"),
      Y: gl.getUniformLocation(program, "uY"),
    };

    // render at ~half resolution, the shader is soft so nobody can tell
    const resize = () => {
      const k = 0.55 * Math.min(1.5, window.devicePixelRatio || 1);
      canvas.width = Math.max(2, (canvas.clientWidth * k) | 0);
      canvas.height = Math.max(2, (canvas.clientHeight * k) | 0);
      gl.viewport(0, 0, canvas.width, canvas.height);
    };

    const draw = () => {
      gl.uniform2f(u.R, canvas.width, canvas.height);
      gl.uniform1f(u.T, state.t);
      gl.uniform1f(u.P, state.p);
      gl.uniform1f(u.G, gain);
      gl.uniform1f(u.Y, y);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    resize();
    draw();
    const ro = new ResizeObserver(() => {
      resize();
      draw();
    });
    ro.observe(canvas);

    if (controlRef) {
      controlRef.current = {
        pulse: () => {
          if (reduced) return;
          gsap
            .timeline()
            .to(state, { p: 1, duration: 0.35, ease: "power2.out" })
            .to(state, { p: 0, duration: 2.2, ease: "power2.inOut" });
        },
      };
    }

    // only animate while it's on screen
    let visible = true;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(canvas);
    const tick = () => {
      if (!visible) return;
      state.t += gsap.ticker.deltaRatio() / 60;
      draw();
    };
    if (!reduced) gsap.ticker.add(tick);

    return () => {
      gsap.ticker.remove(tick);
      ro.disconnect();
      io.disconnect();
    };
  }, [y, gain, seed, controlRef]);

  return <canvas ref={canvasRef} aria-hidden className={className} />;
}
