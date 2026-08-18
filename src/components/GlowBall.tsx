import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

export default function CursorGlow() {
  const mat = useRef<THREE.ShaderMaterial>(null);
  const { mouse } = useThree();

  useFrame(() => {
    if (!mat.current) return;

    mat.current.uniforms.uMouse.value.set(
      mouse.x * 0.5 + 0.5,
      mouse.y * 0.5 + 0.5,
    );
  });

  return (
    <mesh position={[0, 0, 1]}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={mat}
        transparent
        depthWrite={false}
        depthTest={false}
        blending={THREE.AdditiveBlending}
        uniforms={{
          uMouse: { value: new THREE.Vector2(0.5, 0.5) },
          uStrength: { value: 0.0055 },
        }}
        vertexShader={`
          varying vec2 vUv;

          void main() {
            vUv = uv;
            gl_Position = vec4(position, 1.0);
          }
        `}
        fragmentShader={`
          varying vec2 vUv;

          uniform vec2 uMouse;
          uniform float uStrength;

          void main() {
            float d = distance(vUv, uMouse);

            float glow = smoothstep(0.35, 0.0, d);
            glow = pow(glow, 2.5);

            vec3 color = vec3(1.0);

            gl_FragColor = vec4(
              color * glow,
              glow * uStrength
            );
          }
        `}
      />
    </mesh>
  );
}
