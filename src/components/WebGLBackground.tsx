import { Canvas } from "@react-three/fiber";
import { EffectComposer, Vignette } from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import Scene from "./Scene";

const backgroundStyle: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  width: "100vw",
  height: "100vh",
  zIndex: -1,
};

export default function WebGLBackground() {
  return (
    <Canvas style={backgroundStyle} className="text-white" frameloop="always">
      <Scene />
      <EffectComposer>
        <Vignette
          offset={0.3}
          darkness={0.9}
          eskil={false}
          blendFunction={BlendFunction.NORMAL}
        />
      </EffectComposer>
    </Canvas>
  );
}
