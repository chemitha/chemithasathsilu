(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/components/v1/HalftoneReveal.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
(()=>{
    const e = new Error("Cannot find module 'ogl'");
    e.code = 'MODULE_NOT_FOUND';
    throw e;
})();
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
const DEFAULT_SRC = 'https://picsum.photos/seed/halftone-reveal/1200/800';
const hexToRgb = (hex)=>{
    const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex || '');
    return m ? [
        parseInt(m[1], 16) / 255,
        parseInt(m[2], 16) / 255,
        parseInt(m[3], 16) / 255
    ] : [
        0,
        0,
        0
    ];
};
const MODES = {
    mono: 0,
    duotone: 1,
    color: 2
};
const SHAPES = {
    circle: 0,
    square: 1,
    diamond: 2,
    line: 3
};
const TRIGGERS = {
    off: 0,
    hover: 1,
    always: 2,
    never: 3
};
const vertex = `#version 300 es
in vec2 position;
out vec2 vUv;
void main() {
  vUv = position * 0.5 + 0.5;
  gl_Position = vec4(position, 0.0, 1.0);
}
`;
const fragment = `#version 300 es
precision highp float;

uniform sampler2D tMap;
uniform vec2 iResolution;
uniform vec2 uImageSize;
uniform vec2 uMouse;
uniform float uActivity;

uniform float uDotSize;
uniform float uDensity;
uniform float uAngle;
uniform int uShape;
uniform vec3 uInk;
uniform vec3 uPaper;
uniform int uMode;
uniform float uContrast;
uniform float uInvert;

uniform float uRevealRadius;
uniform float uEdge;
uniform float uIdleReveal;
uniform int uTrigger;

in vec2 vUv;
out vec4 fragColor;

vec2 uAspect() {
  return vec2(iResolution.x / max(iResolution.y, 1.0), 1.0);
}

vec2 coverUv(vec2 uv) {
  float ia = uImageSize.x / max(uImageSize.y, 1.0);
  float pa = iResolution.x / max(iResolution.y, 1.0);
  vec2 s = pa > ia ? vec2(1.0, ia / pa) : vec2(pa / ia, 1.0);
  return (uv - 0.5) * s + 0.5;
}

vec3 gradeRGB(vec3 c) {
  c = clamp((c - 0.5) * uContrast + 0.5, 0.0, 1.0);
  return mix(c, 1.0 - c, uInvert);
}

float shapeDist(vec2 f) {
  if (uShape == 1) return max(abs(f.x), abs(f.y));
  if (uShape == 2) return abs(f.x) + abs(f.y);
  if (uShape == 3) return abs(f.y);
  return length(f);
}

mat2 rot(float a) {
  float c = cos(a);
  float s = sin(a);
  return mat2(c, -s, s, c);
}

vec4 sampleCell(vec2 st, float dens, float ang) {
  vec2 rp = rot(ang) * st * dens;
  vec2 center = floor(rp) + 0.5;
  vec2 stC = rot(-ang) * (center / dens);
  vec2 uvC = stC / uAspect();
  return texture(tMap, clamp(coverUv(uvC), 0.0, 1.0));
}

float coverage(vec2 st, float dens, float ang, float ink, float rscale) {
  vec2 rp = rot(ang) * st * dens;
  vec2 f = fract(rp) - 0.5;
  float d = shapeDist(f);
  float r = sqrt(clamp(ink, 0.0, 1.0)) * 0.72 * rscale * uDotSize;
  float w = length(fwidth(rp)) * 0.6 + 1e-4;
  return smoothstep(r + w, r - w, d);
}

void main() {
  vec2 aspect = uAspect();
  vec2 st = vUv * aspect;
  float ang = radians(uAngle);

  vec2 duv = (vUv - uMouse) * aspect;
  float dist = length(duv);

  // If trigger is set to 'never' (3) or 'off' (0), act is 0.0
  float act = (uTrigger == 3 || uTrigger == 2) ? 1.0 : (uTrigger == 0 ? 0.0 : uActivity);
  float radius = max(uRevealRadius, 1e-4) * mix(0.4, 1.0, act);

  float px = 1.4 / max(iResolution.y, 1.0);
  float band = max(px, radius * (1.0 - clamp(uEdge, 0.0, 1.0)) * 0.45);
  float loupe = 1.0 - smoothstep(radius - band, radius + band, dist);
  float focus = clamp(max(loupe * act, uIdleReveal), 0.0, 1.0);

  float dens = uDensity;

  vec3 print;
  if (uMode == 2) {
    vec3 gc = gradeRGB(sampleCell(st, dens, ang + radians(15.0)).rgb);
    vec3 gm = gradeRGB(sampleCell(st, dens, ang + radians(75.0)).rgb);
    vec3 gy = gradeRGB(sampleCell(st, dens, ang).rgb);
    vec3 gk = gradeRGB(sampleCell(st, dens, ang + radians(45.0)).rgb);
    float c = 1.0 - gc.r;
    float m = 1.0 - gm.g;
    float y = 1.0 - gy.b;
    float k = 1.0 - dot(gk, vec3(0.299, 0.587, 0.114));
    float gcr = min(min(c, m), y) * 0.5;
    c = clamp(c - gcr, 0.0, 1.0);
    m = clamp(m - gcr, 0.0, 1.0);
    y = clamp(y - gcr, 0.0, 1.0);
    k = clamp(max(gcr, k * k * 0.9), 0.0, 1.0);
    float covC = coverage(st, dens, ang + radians(15.0), c, 0.82);
    float covM = coverage(st, dens, ang + radians(75.0), m, 0.82);
    float covY = coverage(st, dens, ang, y, 0.82);
    float covK = coverage(st, dens, ang + radians(45.0), k, 0.78);
    print = uPaper;
    print = mix(print, print * vec3(0.10, 0.72, 0.90), covC);
    print = mix(print, print * vec3(0.92, 0.10, 0.52), covM);
    print = mix(print, print * vec3(0.98, 0.86, 0.10), covY);
    print = mix(print, print * vec3(0.08), covK);
  } else if (uMode == 1) {
    vec3 ink2 = mix(uInk.gbr, vec3(0.90, 0.24, 0.30), 0.7);
    float lumA = dot(gradeRGB(sampleCell(st, dens, ang).rgb), vec3(0.299, 0.587, 0.114));
    float lumB = dot(gradeRGB(sampleCell(st, dens, ang + radians(38.0)).rgb), vec3(0.299, 0.587, 0.114));
    float covA = coverage(st, dens, ang, 1.0 - lumA, 1.0);
    float covB = coverage(st, dens, ang + radians(38.0), pow(1.0 - lumB, 1.4), 0.92);
    print = uPaper;
    print = mix(print, ink2, covB * 0.85);
    print = mix(print, uInk, covA);
  } else {
    float lum = dot(gradeRGB(sampleCell(st, dens, ang).rgb), vec3(0.299, 0.587, 0.114));
    float cov = coverage(st, dens, ang, 1.0 - lum, 1.0);
    print = mix(uPaper, uInk, cov);
  }

  float t = clamp(dist / radius, 0.0, 1.0);
  float bend = t * t * t * t;
  vec2 dir = dist > 1e-5 ? duv / dist : vec2(0.0);
  vec2 off = dir * bend * radius * 0.22 / aspect;
  vec2 ca = dir * bend * 0.0045 / aspect;
  vec3 sharp = gradeRGB(vec3(
    texture(tMap, clamp(coverUv(vUv - off - ca), 0.0, 1.0)).r,
    texture(tMap, clamp(coverUv(vUv - off), 0.0, 1.0)).g,
    texture(tMap, clamp(coverUv(vUv - off + ca), 0.0, 1.0)).b
  ));

  vec3 col = mix(print, sharp, focus);
  fragColor = vec4(col, 1.0);
}
`;
const HalftoneReveal = ({ src = DEFAULT_SRC, inkColor = '#141414', paperColor = '#fff7e6', mode = 'mono', dotSize = 1, dotDensity = 71, angle = 45, shape = 'circle', contrast = 1.15, invert = false, revealRadius = 0.4, edge = 0.8, follow = 0.37, idleReveal = 0, trigger = 'hover', borderRadius = '16px', className = '', style })=>{
    _s();
    const containerRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const rendererRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const uniformsRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const rafRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const followRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(follow);
    const videoRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const mouseRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])({
        x: 0.5,
        y: 0.5,
        sx: 0.5,
        sy: 0.5,
        active: 0,
        target: 0
    });
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "HalftoneReveal.useEffect": ()=>{
            followRef.current = follow;
        }
    }["HalftoneReveal.useEffect"], [
        follow
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "HalftoneReveal.useEffect": ()=>{
            const container = containerRef.current;
            if (!container) return;
            const reduced = ("TURBOPACK compile-time value", "object") !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            const renderer = new Renderer({
                dpr: Math.min(window.devicePixelRatio || 1, 2),
                alpha: false,
                antialias: true
            });
            rendererRef.current = renderer;
            const gl = renderer.gl;
            gl.clearColor(0, 0, 0, 1);
            gl.canvas.style.width = '100%';
            gl.canvas.style.height = '100%';
            gl.canvas.style.display = 'block';
            container.appendChild(gl.canvas);
            const texture = new Texture(gl, {
                generateMipmaps: false
            });
            const uniforms = {
                tMap: {
                    value: texture
                },
                iResolution: {
                    value: [
                        1,
                        1
                    ]
                },
                uImageSize: {
                    value: [
                        1,
                        1
                    ]
                },
                uMouse: {
                    value: [
                        0.5,
                        0.5
                    ]
                },
                uActivity: {
                    value: 0
                },
                uDotSize: {
                    value: dotSize
                },
                uDensity: {
                    value: dotDensity
                },
                uAngle: {
                    value: angle
                },
                uShape: {
                    value: SHAPES[shape] ?? 0
                },
                uInk: {
                    value: hexToRgb(inkColor)
                },
                uPaper: {
                    value: hexToRgb(paperColor)
                },
                uMode: {
                    value: MODES[mode] ?? 0
                },
                uContrast: {
                    value: contrast
                },
                uInvert: {
                    value: invert ? 1 : 0
                },
                uRevealRadius: {
                    value: revealRadius
                },
                uEdge: {
                    value: edge
                },
                uIdleReveal: {
                    value: idleReveal
                },
                uTrigger: {
                    value: TRIGGERS[trigger] ?? 1
                }
            };
            uniformsRef.current = uniforms;
            const program = new Program(gl, {
                vertex,
                fragment,
                uniforms
            });
            const mesh = new Mesh(gl, {
                geometry: new Triangle(gl),
                program
            });
            const isVideo = src.match(/\.(mp4|webm|ogg)$/i) !== null;
            if (isVideo) {
                const vid = document.createElement('video');
                vid.crossOrigin = 'anonymous';
                vid.src = src;
                vid.loop = true;
                vid.muted = true;
                vid.playsInline = true;
                vid.autoplay = true;
                const playPromise = vid.play();
                if (playPromise !== undefined) {
                    playPromise.catch({
                        "HalftoneReveal.useEffect": (error)=>{
                            if (error.name !== 'AbortError') {
                                console.error('Video play error:', error);
                            }
                        }
                    }["HalftoneReveal.useEffect"]);
                }
                vid.onloadedmetadata = ({
                    "HalftoneReveal.useEffect": ()=>{
                        texture.image = vid;
                        uniforms.uImageSize.value = [
                            vid.videoWidth,
                            vid.videoHeight
                        ];
                    }
                })["HalftoneReveal.useEffect"];
                videoRef.current = vid;
            } else {
                const img = new Image();
                img.crossOrigin = 'anonymous';
                img.src = src;
                img.onload = ({
                    "HalftoneReveal.useEffect": ()=>{
                        texture.image = img;
                        uniforms.uImageSize.value = [
                            img.naturalWidth,
                            img.naturalHeight
                        ];
                    }
                })["HalftoneReveal.useEffect"];
            }
            const resize = {
                "HalftoneReveal.useEffect.resize": ()=>{
                    const w = container.clientWidth || 1;
                    const h = container.clientHeight || 1;
                    renderer.setSize(w, h);
                    uniforms.iResolution.value = [
                        gl.canvas.width,
                        gl.canvas.height
                    ];
                }
            }["HalftoneReveal.useEffect.resize"];
            resize();
            const ro = new ResizeObserver(resize);
            ro.observe(container);
            const onMove = {
                "HalftoneReveal.useEffect.onMove": (e)=>{
                    const rect = container.getBoundingClientRect();
                    mouseRef.current.x = (e.clientX - rect.left) / rect.width;
                    mouseRef.current.y = 1 - (e.clientY - rect.top) / rect.height;
                    mouseRef.current.target = reduced ? 0 : 1;
                }
            }["HalftoneReveal.useEffect.onMove"];
            const onLeave = {
                "HalftoneReveal.useEffect.onLeave": ()=>{
                    mouseRef.current.target = 0;
                }
            }["HalftoneReveal.useEffect.onLeave"];
            // Only attach window listeners if trigger is NOT 'never'
            if (trigger !== 'never') {
                window.addEventListener('pointermove', onMove, {
                    passive: true
                });
                window.addEventListener('pointerout', onLeave, {
                    passive: true
                });
            }
            let prev = performance.now();
            const loop = {
                "HalftoneReveal.useEffect.loop": (now)=>{
                    rafRef.current = requestAnimationFrame(loop);
                    const dt = Math.min(0.05, Math.max(0.001, (now - prev) / 1000));
                    prev = now;
                    if (videoRef.current && videoRef.current.readyState >= videoRef.current.HAVE_CURRENT_DATA) {
                        texture.needsUpdate = true;
                    }
                    const m = mouseRef.current;
                    const a = 1 - Math.exp(-dt / Math.max(0.001, followRef.current));
                    m.sx += (m.x - m.sx) * a;
                    m.sy += (m.y - m.sy) * a;
                    const ba = 1 - Math.exp(-dt / 0.18);
                    m.active += (m.target - m.active) * ba;
                    uniforms.uMouse.value[0] = m.sx;
                    uniforms.uMouse.value[1] = m.sy;
                    uniforms.uActivity.value = m.active;
                    renderer.render({
                        scene: mesh
                    });
                }
            }["HalftoneReveal.useEffect.loop"];
            rafRef.current = requestAnimationFrame(loop);
            return ({
                "HalftoneReveal.useEffect": ()=>{
                    if (rafRef.current) cancelAnimationFrame(rafRef.current);
                    if (videoRef.current) {
                        const vid = videoRef.current;
                        vid.pause();
                        vid.removeAttribute('src');
                        vid.load();
                    }
                    ro.disconnect();
                    if (trigger !== 'never') {
                        window.removeEventListener('pointermove', onMove);
                        window.removeEventListener('pointerout', onLeave);
                    }
                    const ext = gl.getExtension('WEBGL_lose_context');
                    if (ext) ext.loseContext();
                    if (gl.canvas.parentNode) gl.canvas.parentNode.removeChild(gl.canvas);
                    rendererRef.current = null;
                    uniformsRef.current = null;
                }
            })["HalftoneReveal.useEffect"];
        }
    }["HalftoneReveal.useEffect"], [
        src,
        trigger
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "HalftoneReveal.useEffect": ()=>{
            const u = uniformsRef.current;
            if (!u) return;
            u.uDotSize.value = dotSize;
            u.uDensity.value = dotDensity;
            u.uAngle.value = angle;
            u.uShape.value = SHAPES[shape] ?? 0;
            u.uInk.value = hexToRgb(inkColor);
            u.uPaper.value = hexToRgb(paperColor);
            u.uMode.value = MODES[mode] ?? 0;
            u.uContrast.value = contrast;
            u.uInvert.value = invert ? 1 : 0;
            u.uRevealRadius.value = revealRadius;
            u.uEdge.value = edge;
            u.uIdleReveal.value = idleReveal;
            u.uTrigger.value = TRIGGERS[trigger] ?? 1;
        }
    }["HalftoneReveal.useEffect"], [
        dotSize,
        dotDensity,
        angle,
        shape,
        inkColor,
        paperColor,
        mode,
        contrast,
        invert,
        revealRadius,
        edge,
        idleReveal,
        trigger
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        ref: containerRef,
        className: `relative w-full h-full overflow-hidden pointer-events-none ${className}`.trim(),
        style: {
            borderRadius,
            ...style
        }
    }, void 0, false, {
        fileName: "[project]/components/v1/HalftoneReveal.tsx",
        lineNumber: 420,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
};
_s(HalftoneReveal, "JEqSv7DhjE/+Yc2r7IXRXfhJXNc=");
_c = HalftoneReveal;
const __TURBOPACK__default__export__ = HalftoneReveal;
var _c;
__turbopack_context__.k.register(_c, "HalftoneReveal");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/v1/SeamlessVideo.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "SeamlessVideoBackground",
    ()=>SeamlessVideoBackground,
    "SeamlessVideoWithHalftone",
    ()=>SeamlessVideoWithHalftone,
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$v1$2f$HalftoneReveal$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/v1/HalftoneReveal.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$usePerformanceTier$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/usePerformanceTier.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
"use client";
;
;
;
const VIDEO_SPEED = 0.4;
const SeamlessVideoBackground = ({ fallbackImageSrc = "/background-fallback.webp" })=>{
    _s();
    const video1Ref = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const video2Ref = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const [activeVideo, setActiveVideo] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(1);
    const FADE_DURATION = 1.5;
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "SeamlessVideoBackground.useEffect": ()=>{
            if (video1Ref.current) video1Ref.current.playbackRate = VIDEO_SPEED;
            if (video2Ref.current) video2Ref.current.playbackRate = VIDEO_SPEED;
        }
    }["SeamlessVideoBackground.useEffect"], []);
    const handleTimeUpdate = (videoNum)=>{
        const currentVideo = videoNum === 1 ? video1Ref.current : video2Ref.current;
        const nextVideo = videoNum === 1 ? video2Ref.current : video1Ref.current;
        if (!currentVideo || !nextVideo) return;
        const timeLeft = currentVideo.duration - currentVideo.currentTime;
        if (timeLeft <= FADE_DURATION && activeVideo === videoNum) {
            nextVideo.currentTime = 0;
            nextVideo.playbackRate = VIDEO_SPEED;
            nextVideo.play();
            setActiveVideo(videoNum === 1 ? 2 : 1);
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-black",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("video", {
                ref: video1Ref,
                autoPlay: true,
                muted: true,
                playsInline: true,
                poster: fallbackImageSrc,
                onLoadedMetadata: (e)=>{
                    e.currentTarget.playbackRate = VIDEO_SPEED;
                },
                onTimeUpdate: ()=>handleTimeUpdate(1),
                className: `absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${activeVideo === 1 ? "opacity-100" : "opacity-0"}`,
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("source", {
                    src: "/night-coludysky.mp4",
                    type: "video/mp4"
                }, void 0, false, {
                    fileName: "[project]/components/v1/SeamlessVideo.tsx",
                    lineNumber: 60,
                    columnNumber: 9
                }, ("TURBOPACK compile-time value", void 0))
            }, void 0, false, {
                fileName: "[project]/components/v1/SeamlessVideo.tsx",
                lineNumber: 46,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("video", {
                ref: video2Ref,
                muted: true,
                playsInline: true,
                poster: fallbackImageSrc,
                onLoadedMetadata: (e)=>{
                    e.currentTarget.playbackRate = VIDEO_SPEED;
                },
                onTimeUpdate: ()=>handleTimeUpdate(2),
                className: `absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${activeVideo === 2 ? "opacity-100" : "opacity-0"}`,
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("source", {
                    src: "/night-coludysky.mp4",
                    type: "video/mp4"
                }, void 0, false, {
                    fileName: "[project]/components/v1/SeamlessVideo.tsx",
                    lineNumber: 76,
                    columnNumber: 9
                }, ("TURBOPACK compile-time value", void 0))
            }, void 0, false, {
                fileName: "[project]/components/v1/SeamlessVideo.tsx",
                lineNumber: 63,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute inset-0 bg-black/65 backdrop-blur-sm"
            }, void 0, false, {
                fileName: "[project]/components/v1/SeamlessVideo.tsx",
                lineNumber: 79,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0))
        ]
    }, void 0, true, {
        fileName: "[project]/components/v1/SeamlessVideo.tsx",
        lineNumber: 45,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
};
_s(SeamlessVideoBackground, "9Xam1U0W+Sj8fjxHobT7YGF5/DE=");
_c = SeamlessVideoBackground;
const SeamlessVideoWithHalftone = ({ fallbackImageSrc = "/background-fallback.webp" })=>{
    _s1();
    const isLowSpec = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$usePerformanceTier$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["usePerformanceTier"])();
    // PERFORMANCE OPTIMIZED FALLBACK (Image + CSS Halftone Overlay)
    if (isLowSpec) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "fixed inset-0 -z-10 overflow-hidden pointer-events-none bg-[#0a0a0a]",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                    src: fallbackImageSrc,
                    alt: "Background Fallback",
                    className: "absolute inset-0 h-full w-full object-cover opacity-60"
                }, void 0, false, {
                    fileName: "[project]/components/v1/SeamlessVideo.tsx",
                    lineNumber: 95,
                    columnNumber: 9
                }, ("TURBOPACK compile-time value", void 0)),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "absolute inset-0 pointer-events-none opacity-30 mix-blend-screen",
                    style: {
                        backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.8) 1.5px, transparent 1.5px)`,
                        backgroundSize: `12px 12px`
                    }
                }, void 0, false, {
                    fileName: "[project]/components/v1/SeamlessVideo.tsx",
                    lineNumber: 102,
                    columnNumber: 9
                }, ("TURBOPACK compile-time value", void 0)),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "absolute inset-0 bg-black/40"
                }, void 0, false, {
                    fileName: "[project]/components/v1/SeamlessVideo.tsx",
                    lineNumber: 111,
                    columnNumber: 9
                }, ("TURBOPACK compile-time value", void 0))
            ]
        }, void 0, true, {
            fileName: "[project]/components/v1/SeamlessVideo.tsx",
            lineNumber: 93,
            columnNumber: 7
        }, ("TURBOPACK compile-time value", void 0));
    }
    // HIGH PERFORMANCE TIER (WebGL Shader & Video Playback)
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "fixed inset-0 -z-10 overflow-hidden pointer-events-auto",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(SeamlessVideoBackground, {
                fallbackImageSrc: fallbackImageSrc
            }, void 0, false, {
                fileName: "[project]/components/v1/SeamlessVideo.tsx",
                lineNumber: 119,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute inset-0 opacity-40 mix-blend-screen pointer-events-auto",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$v1$2f$HalftoneReveal$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                    src: "/night-coludysky.mp4",
                    inkColor: "#0a0a0a",
                    paperColor: "#1a1a2e",
                    mode: "mono",
                    dotDensity: 90,
                    dotSize: 1.6,
                    angle: 30,
                    revealRadius: 0.35,
                    borderRadius: "0px",
                    trigger: "never"
                }, void 0, false, {
                    fileName: "[project]/components/v1/SeamlessVideo.tsx",
                    lineNumber: 121,
                    columnNumber: 9
                }, ("TURBOPACK compile-time value", void 0))
            }, void 0, false, {
                fileName: "[project]/components/v1/SeamlessVideo.tsx",
                lineNumber: 120,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0))
        ]
    }, void 0, true, {
        fileName: "[project]/components/v1/SeamlessVideo.tsx",
        lineNumber: 118,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
};
_s1(SeamlessVideoWithHalftone, "Nm0gZraAB47oDD8UFtQXMPKy/wo=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$usePerformanceTier$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["usePerformanceTier"]
    ];
});
_c1 = SeamlessVideoWithHalftone;
const __TURBOPACK__default__export__ = SeamlessVideoWithHalftone;
var _c, _c1;
__turbopack_context__.k.register(_c, "SeamlessVideoBackground");
__turbopack_context__.k.register(_c1, "SeamlessVideoWithHalftone");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/v1/Skiper61.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "SimpleGlobalCursor",
    ()=>SimpleGlobalCursor,
    "SimpleMouseFollow",
    ()=>SimpleMouseFollow,
    "Skiper61",
    ()=>Skiper61,
    "SpringGlobalCursor",
    ()=>SpringGlobalCursor,
    "SpringMouseFollow",
    ()=>SpringMouseFollow
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
// TODO create a how to collection and plce it in them
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/framer-motion/dist/es/render/components/motion/proxy.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$value$2f$use$2d$motion$2d$value$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/framer-motion/dist/es/value/use-motion-value.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$value$2f$use$2d$spring$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/framer-motion/dist/es/value/use-spring.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature(), _s2 = __turbopack_context__.k.signature(), _s3 = __turbopack_context__.k.signature();
"use client";
;
;
const SPRING = {
    mass: 0.1,
    damping: 10,
    stiffness: 151
};
const SimpleMouseFollow = ()=>{
    _s();
    const x = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$value$2f$use$2d$motion$2d$value$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMotionValue"])(0);
    const y = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$value$2f$use$2d$motion$2d$value$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMotionValue"])(0);
    const opacity = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$value$2f$use$2d$motion$2d$value$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMotionValue"])(0);
    const handlePointerMove = (e)=>{
        const bounds = e.currentTarget.getBoundingClientRect();
        x.set(e.clientX - bounds.left);
        y.set(e.clientY - bounds.top);
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        onPointerMove: (e)=>{
            handlePointerMove(e);
        },
        onPointerEnter: ()=>{
            opacity.set(1);
        },
        onPointerLeave: ()=>{
            opacity.set(0);
        },
        className: "rounded-4xl bg-background mt-20 size-[500px] cursor-none overflow-hidden",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
            style: {
                x,
                y,
                opacity
            },
            className: "rounded-4xl size-5 bg-[#ccc]"
        }, void 0, false, {
            fileName: "[project]/components/v1/Skiper61.tsx",
            lineNumber: 38,
            columnNumber: 7
        }, ("TURBOPACK compile-time value", void 0))
    }, void 0, false, {
        fileName: "[project]/components/v1/Skiper61.tsx",
        lineNumber: 26,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
};
_s(SimpleMouseFollow, "AibtJgERzkdyCf7K8nE/6lUUUvI=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$value$2f$use$2d$motion$2d$value$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMotionValue"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$value$2f$use$2d$motion$2d$value$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMotionValue"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$value$2f$use$2d$motion$2d$value$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMotionValue"]
    ];
});
_c = SimpleMouseFollow;
const SpringMouseFollow = ()=>{
    _s1();
    const xSpring = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$value$2f$use$2d$spring$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSpring"])(0, SPRING);
    const ySpring = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$value$2f$use$2d$spring$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSpring"])(0, SPRING);
    const opacitySpring = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$value$2f$use$2d$spring$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSpring"])(0, SPRING);
    const scaleSpring = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$value$2f$use$2d$spring$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSpring"])(0, SPRING);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        onPointerMove: (e)=>{
            const bounds = e.currentTarget.getBoundingClientRect();
            xSpring.set(e.clientX - bounds.left);
            ySpring.set(e.clientY - bounds.top);
        },
        onPointerEnter: ()=>{
            opacitySpring.set(1);
            scaleSpring.set(1);
        },
        onPointerLeave: ()=>{
            opacitySpring.set(0);
            scaleSpring.set(0);
        },
        className: "rounded-4xl bg-background mt-20 size-[500px] overflow-hidden",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
            style: {
                x: xSpring,
                y: ySpring,
                opacity: opacitySpring,
                scale: scaleSpring
            },
            className: "rounded-4xl size-5 bg-white hidden md:block"
        }, void 0, false, {
            fileName: "[project]/components/v1/Skiper61.tsx",
            lineNumber: 73,
            columnNumber: 7
        }, ("TURBOPACK compile-time value", void 0))
    }, void 0, false, {
        fileName: "[project]/components/v1/Skiper61.tsx",
        lineNumber: 57,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
};
_s1(SpringMouseFollow, "Pb+V4jaKLz4Xdv39oxS9l4ZEVuY=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$value$2f$use$2d$spring$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSpring"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$value$2f$use$2d$spring$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSpring"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$value$2f$use$2d$spring$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSpring"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$value$2f$use$2d$spring$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSpring"]
    ];
});
_c1 = SpringMouseFollow;
const SimpleGlobalCursor = ()=>{
    _s2();
    const x = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$value$2f$use$2d$motion$2d$value$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMotionValue"])(-100);
    const y = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$value$2f$use$2d$motion$2d$value$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMotionValue"])(-100);
    const opacity = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$value$2f$use$2d$motion$2d$value$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMotionValue"])(0);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "SimpleGlobalCursor.useEffect": ()=>{
            const handlePointerMove = {
                "SimpleGlobalCursor.useEffect.handlePointerMove": (e)=>{
                    x.set(e.clientX);
                    y.set(e.clientY);
                    if (opacity.get() === 0) {
                        opacity.set(1);
                    }
                }
            }["SimpleGlobalCursor.useEffect.handlePointerMove"];
            const handleMouseLeave = {
                "SimpleGlobalCursor.useEffect.handleMouseLeave": ()=>{
                    opacity.set(0);
                }
            }["SimpleGlobalCursor.useEffect.handleMouseLeave"];
            const handleMouseEnter = {
                "SimpleGlobalCursor.useEffect.handleMouseEnter": ()=>{
                    opacity.set(1);
                }
            }["SimpleGlobalCursor.useEffect.handleMouseEnter"];
            window.addEventListener("pointermove", handlePointerMove);
            document.documentElement.addEventListener("mouseleave", handleMouseLeave);
            document.documentElement.addEventListener("mouseenter", handleMouseEnter);
            return ({
                "SimpleGlobalCursor.useEffect": ()=>{
                    window.removeEventListener("pointermove", handlePointerMove);
                    document.documentElement.removeEventListener("mouseleave", handleMouseLeave);
                    document.documentElement.removeEventListener("mouseenter", handleMouseEnter);
                }
            })["SimpleGlobalCursor.useEffect"];
        }
    }["SimpleGlobalCursor.useEffect"], [
        x,
        y,
        opacity
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
        style: {
            x,
            y,
            opacity
        },
        className: "!z-99 pointer-events-none fixed top-0 left-0 z-50 hidden size-5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white mix-blend-difference md:block"
    }, void 0, false, {
        fileName: "[project]/components/v1/Skiper61.tsx",
        lineNumber: 121,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
};
_s2(SimpleGlobalCursor, "jMjWigLenIAdveRqo0FPtvg1UFg=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$value$2f$use$2d$motion$2d$value$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMotionValue"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$value$2f$use$2d$motion$2d$value$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMotionValue"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$value$2f$use$2d$motion$2d$value$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMotionValue"]
    ];
});
_c2 = SimpleGlobalCursor;
const SpringGlobalCursor = ()=>{
    _s3();
    const xSpring = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$value$2f$use$2d$spring$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSpring"])(-100, SPRING);
    const ySpring = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$value$2f$use$2d$spring$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSpring"])(-100, SPRING);
    const opacitySpring = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$value$2f$use$2d$spring$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSpring"])(0, SPRING);
    const scaleSpring = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$value$2f$use$2d$spring$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSpring"])(0, SPRING);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "SpringGlobalCursor.useEffect": ()=>{
            const handlePointerMove = {
                "SpringGlobalCursor.useEffect.handlePointerMove": (e)=>{
                    xSpring.set(e.clientX);
                    ySpring.set(e.clientY);
                    if (opacitySpring.get() === 0) {
                        opacitySpring.set(1);
                        scaleSpring.set(1);
                    }
                    // Check if hovered element or its parent is interactive
                    const target = e.target;
                    const isHoveredPointer = target?.closest('a, button, [role="button"], input, select, textarea, [data-cursor="pointer"]');
                    // Scale up cursor on hover (e.g., 2.5x size)
                    if (isHoveredPointer) {
                        scaleSpring.set(2.5);
                    } else {
                        scaleSpring.set(1);
                    }
                }
            }["SpringGlobalCursor.useEffect.handlePointerMove"];
            const handleMouseLeave = {
                "SpringGlobalCursor.useEffect.handleMouseLeave": ()=>{
                    opacitySpring.set(0);
                    scaleSpring.set(0);
                }
            }["SpringGlobalCursor.useEffect.handleMouseLeave"];
            const handleMouseEnter = {
                "SpringGlobalCursor.useEffect.handleMouseEnter": ()=>{
                    opacitySpring.set(1);
                    scaleSpring.set(1);
                }
            }["SpringGlobalCursor.useEffect.handleMouseEnter"];
            window.addEventListener("pointermove", handlePointerMove);
            document.documentElement.addEventListener("mouseleave", handleMouseLeave);
            document.documentElement.addEventListener("mouseenter", handleMouseEnter);
            return ({
                "SpringGlobalCursor.useEffect": ()=>{
                    window.removeEventListener("pointermove", handlePointerMove);
                    document.documentElement.removeEventListener("mouseleave", handleMouseLeave);
                    document.documentElement.removeEventListener("mouseenter", handleMouseEnter);
                }
            })["SpringGlobalCursor.useEffect"];
        }
    }["SpringGlobalCursor.useEffect"], [
        xSpring,
        ySpring,
        opacitySpring,
        scaleSpring
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
        style: {
            x: xSpring,
            y: ySpring,
            opacity: opacitySpring,
            scale: scaleSpring
        },
        className: "pointer-events-none fixed top-0 left-0 z-[9999] hidden size-5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white mix-blend-difference md:block"
    }, void 0, false, {
        fileName: "[project]/components/v1/Skiper61.tsx",
        lineNumber: 184,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
};
_s3(SpringGlobalCursor, "NA8a35aQEz8lZcxdy3wf+j5pQLA=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$value$2f$use$2d$spring$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSpring"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$value$2f$use$2d$spring$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSpring"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$value$2f$use$2d$spring$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSpring"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$value$2f$use$2d$spring$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSpring"]
    ];
});
_c3 = SpringGlobalCursor;
const Skiper61 = ()=>{
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
        className: "h-screen w-full snap-y snap-mandatory overflow-y-scroll",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex h-screen w-full snap-start flex-col items-center justify-center px-5",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "grid content-start justify-items-center gap-6 text-center",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "after:to-foreground relative max-w-[12ch] text-xs uppercase leading-tight opacity-40 after:absolute after:left-1/2 after:top-full after:h-16 after:w-px after:bg-gradient-to-b after:from-transparent after:content-['']",
                            children: "Mouse follow simple"
                        }, void 0, false, {
                            fileName: "[project]/components/v1/Skiper61.tsx",
                            lineNumber: 201,
                            columnNumber: 11
                        }, ("TURBOPACK compile-time value", void 0))
                    }, void 0, false, {
                        fileName: "[project]/components/v1/Skiper61.tsx",
                        lineNumber: 200,
                        columnNumber: 9
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(SimpleMouseFollow, {}, void 0, false, {
                        fileName: "[project]/components/v1/Skiper61.tsx",
                        lineNumber: 205,
                        columnNumber: 9
                    }, ("TURBOPACK compile-time value", void 0))
                ]
            }, void 0, true, {
                fileName: "[project]/components/v1/Skiper61.tsx",
                lineNumber: 199,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex h-screen w-full snap-start flex-col items-center justify-center px-5",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "grid content-start justify-items-center gap-6 text-center",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "after:to-foreground relative max-w-[12ch] text-xs uppercase leading-tight opacity-40 after:absolute after:left-1/2 after:top-full after:h-16 after:w-px after:bg-gradient-to-b after:from-transparent after:content-['']",
                            children: "Mouse follow with Spring"
                        }, void 0, false, {
                            fileName: "[project]/components/v1/Skiper61.tsx",
                            lineNumber: 209,
                            columnNumber: 11
                        }, ("TURBOPACK compile-time value", void 0))
                    }, void 0, false, {
                        fileName: "[project]/components/v1/Skiper61.tsx",
                        lineNumber: 208,
                        columnNumber: 9
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(SpringMouseFollow, {}, void 0, false, {
                        fileName: "[project]/components/v1/Skiper61.tsx",
                        lineNumber: 213,
                        columnNumber: 9
                    }, ("TURBOPACK compile-time value", void 0))
                ]
            }, void 0, true, {
                fileName: "[project]/components/v1/Skiper61.tsx",
                lineNumber: 207,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0))
        ]
    }, void 0, true, {
        fileName: "[project]/components/v1/Skiper61.tsx",
        lineNumber: 198,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
};
_c4 = Skiper61;
;
var _c, _c1, _c2, _c3, _c4;
__turbopack_context__.k.register(_c, "SimpleMouseFollow");
__turbopack_context__.k.register(_c1, "SpringMouseFollow");
__turbopack_context__.k.register(_c2, "SimpleGlobalCursor");
__turbopack_context__.k.register(_c3, "SpringGlobalCursor");
__turbopack_context__.k.register(_c4, "Skiper61");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/lib/usePerformanceTier.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "usePerformanceTier",
    ()=>usePerformanceTier
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var _s = __turbopack_context__.k.signature();
"use client";
;
function isWeakGPU() {
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    try {
        const canvas = document.createElement("canvas");
        const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
        if (!gl || !(gl instanceof WebGLRenderingContext)) return false;
        const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
        if (!debugInfo) return false;
        const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL).toLowerCase();
        // Only match explicitly weak virtualized software renderers
        return renderer.includes("swiftshader") || renderer.includes("llvmpipe") || renderer.includes("basic render");
    } catch  {
        return false;
    }
}
function usePerformanceTier() {
    _s();
    const [isLowSpec, setIsLowSpec] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "usePerformanceTier.useEffect": ()=>{
            if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
            ;
            // 1. Check strict hardware limitations (1 core or <= 1GB RAM)
            const cores = navigator.hardwareConcurrency || 4;
            const nav = navigator;
            const memory = nav.deviceMemory || 4;
            const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
            if (cores <= 1 || Number(memory) <= 1 || prefersReducedMotion || isWeakGPU()) {
                setIsLowSpec(true);
                return;
            }
            // 2. Continuous FPS monitor: require 3 consecutive bad seconds before degrading
            let frameCount = 0;
            let startTime = performance.now();
            let badSecondCount = 0;
            let rafId;
            const measureFPS = {
                "usePerformanceTier.useEffect.measureFPS": ()=>{
                    frameCount++;
                    const now = performance.now();
                    const elapsed = now - startTime;
                    if (elapsed >= 1000) {
                        const fps = frameCount * 1000 / elapsed;
                        // Only count as low performance if FPS drops below 20 FPS
                        if (fps < 20) {
                            badSecondCount++;
                        } else {
                            badSecondCount = 0; // reset on recovery
                        }
                        if (badSecondCount >= 3) {
                            setIsLowSpec(true);
                            return;
                        }
                        frameCount = 0;
                        startTime = performance.now();
                    }
                    rafId = requestAnimationFrame(measureFPS);
                }
            }["usePerformanceTier.useEffect.measureFPS"];
            // Delay start of FPS tracking by 2.5s to ignore initial load/hydration lag spikes
            const startTimeout = setTimeout({
                "usePerformanceTier.useEffect.startTimeout": ()=>{
                    rafId = requestAnimationFrame(measureFPS);
                }
            }["usePerformanceTier.useEffect.startTimeout"], 2500);
            return ({
                "usePerformanceTier.useEffect": ()=>{
                    clearTimeout(startTimeout);
                    cancelAnimationFrame(rafId);
                }
            })["usePerformanceTier.useEffect"];
        }
    }["usePerformanceTier.useEffect"], []);
    return isLowSpec;
}
_s(usePerformanceTier, "3H4P2T3cOK619VLIZC8iKCBVX9w=");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=_0tcqx2i._.js.map