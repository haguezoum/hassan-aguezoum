import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

// ── Config ────────────────────────────────────────────────────────────────────
const GRID_BASE_OPACITY   = 0.025; // resting brightness of unlit grid lines
const SPOT_INTENSITY      = 0.15;   // center spot light brightness
const SPOT_RADIUS         = 4;  // center spot reach in world units
const MOUSE_INTENSITY     = 0.095;   // mouse light brightness
const MOUSE_RADIUS        = 4.5;  // mouse light spread in world units

// ── Grid geometry — vertical XY plane ────────────────────────────────────────
function buildGridGeometry(size: number, divisions: number): THREE.BufferGeometry {
  const half = size / 2;
  const step = size / divisions;
  const verts: number[] = [];
  for (let i = 0; i <= divisions; i++) {
    const y = -half + i * step;
    verts.push(-half, y, 0, half, y, 0);
  }
  for (let j = 0; j <= divisions; j++) {
    const x = -half + j * step;
    verts.push(x, -half, 0, x, half, 0);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(verts), 3));
  return geo;
}

// ── Scene ─────────────────────────────────────────────────────────────────────
const Scene = () => {
  const pivotRef       = useRef<THREE.Group>(null);
  const mouseLightRef  = useRef<THREE.PointLight>(null);
  const tiltTarget     = useRef(new THREE.Vector2());
  const tiltCurrent    = useRef(new THREE.Vector2());
  const ndcMouse       = useRef(new THREE.Vector2());
  const reduceMotion   = useRef(false);

  const { gl, camera, size } = useThree();

  // Scale both grid size and cell count with the screen width
  const { divisions, gridSize } = useMemo(() => {
    if (size.width < 480)  return { divisions: 15, gridSize: 16 };
    if (size.width < 768)  return { divisions: 27, gridSize: 22 };
    if (size.width < 1280) return { divisions: 43, gridSize: 28 };
    return                        { divisions: 59, gridSize: 32 };
  }, [size.width]);

  const gridGeo = useMemo(() => buildGridGeometry(gridSize, divisions), [gridSize, divisions]);

  // LineBasicMaterial doesn't respond to lights — use MeshBasicMaterial-like
  // workaround: we need a material that works on LineSegments AND reacts to
  // lights. The trick is LineMaterial doesn't support lighting either, so we
  // use a ShaderMaterial that manually computes distance-based brightness
  // from the two light positions passed as uniforms.
  const gridMat = useMemo(() => new THREE.ShaderMaterial({
    uniforms: {
      uSpotPos:   { value: new THREE.Vector3(0, 0, 8) },   // center spot (world)
      uMousePos:  { value: new THREE.Vector3(0, 0, 8) },   // mouse light (world)
      uBaseColor: { value: new THREE.Color(0xffffff) },
      uBaseOpacity: { value: GRID_BASE_OPACITY },
      uSpotIntensity:  { value: SPOT_INTENSITY },
      uMouseIntensity: { value: MOUSE_INTENSITY },
      uSpotRadius:     { value: SPOT_RADIUS },
      uMouseRadius:    { value: MOUSE_RADIUS },
    },
    vertexShader: /* glsl */`
      varying vec3 vWorldPos;
      void main() {
        vec4 wp = modelMatrix * vec4(position, 1.0);
        vWorldPos = wp.xyz;
        gl_Position = projectionMatrix * viewMatrix * wp;
      }
    `,
    fragmentShader: /* glsl */`
      uniform vec3  uSpotPos;
      uniform vec3  uMousePos;
      uniform vec3  uBaseColor;
      uniform float uBaseOpacity;
      uniform float uSpotIntensity;
      uniform float uMouseIntensity;
      uniform float uSpotRadius;
      uniform float uMouseRadius;

      varying vec3 vWorldPos;

      float lightContrib(vec3 lightPos, float radius, float intensity) {
        float d = distance(vWorldPos, lightPos);
        return intensity * (1.0 - smoothstep(0.0, radius, d));
      }

      void main() {
        float spot  = lightContrib(uSpotPos,  uSpotRadius,  uSpotIntensity);
        float mouse = lightContrib(uMousePos, uMouseRadius, uMouseIntensity);
        float brightness = uBaseOpacity + spot + mouse;
        gl_FragColor = vec4(uBaseColor, clamp(brightness, 0.0, 1.0));
      }
    `,
    transparent: true,
    depthWrite:  false,
    blending:    THREE.AdditiveBlending,
  }), []);

  // Raycast plane at Z=0 to get mouse world position
  const rayPlane  = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 0, 1), 0), []);
  const raycaster = useMemo(() => new THREE.Raycaster(), []);
  const worldHit  = useMemo(() => new THREE.Vector3(), []);

  // ── Pointer handlers ──────────────────────────────────────────────────────
  const handlePointerMove = (e: PointerEvent) => {
    const rect = gl.domElement.getBoundingClientRect();
    const nx =  ((e.clientX - rect.left) / rect.width)  * 2 - 1;
    const ny = -((e.clientY - rect.top)  / rect.height) * 2 + 1;
    ndcMouse.current.set(nx, ny);
    tiltTarget.current.set(ny * 0.18, nx * 0.18);
  };
  const handlePointerLeave = () => tiltTarget.current.set(0, 0);

  useEffect(() => {
    reduceMotion.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Listen on window — not the canvas — so the light keeps following the
    // cursor even when it moves over HTML elements stacked above the canvas.
    window.addEventListener("pointermove",  handlePointerMove);
    window.addEventListener("pointerleave", handlePointerLeave);
    return () => {
      window.removeEventListener("pointermove",  handlePointerMove);
      window.removeEventListener("pointerleave", handlePointerLeave);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gl]);

  // ── Per-frame ─────────────────────────────────────────────────────────────
  useFrame(() => {
    // smooth tilt
    const tc = tiltCurrent.current;
    const tt = tiltTarget.current;
    const targetX = reduceMotion.current ? 0 : tt.x;
    const targetY = reduceMotion.current ? 0 : tt.y;
    tc.x += (targetX - tc.x) * 0.015;
    tc.y += (targetY - tc.y) * 0.015;
    if (pivotRef.current) {
      pivotRef.current.rotation.x = tc.x;
      pivotRef.current.rotation.y = tc.y;
    }

    // mouse world position on Z=0 plane → update shader uniform
    raycaster.setFromCamera(ndcMouse.current, camera);
    const hit = raycaster.ray.intersectPlane(rayPlane, worldHit);
    if (hit) {
      gridMat.uniforms.uMousePos.value.copy(worldHit);
      if (mouseLightRef.current) mouseLightRef.current.position.copy(worldHit);
    }
  });

  return (
    <group ref={pivotRef}>
      {/* Center spot — always on, illuminates the grid evenly */}
      <pointLight
        position={[0, 0, 6]}
        intensity={0}   // visual-only via shader; keep at 0 to avoid double-lighting
        color="#ffffff"
      />

      {/* Mouse-following light — moves in world space, not pivot space */}
      <pointLight
        ref={mouseLightRef}
        position={[0, 0, 6]}
        intensity={5}   // same — shader handles it
        color="#ffffff"
      />

      <lineSegments geometry={gridGeo} material={gridMat} />
    </group>
  );
};

export default Scene;
