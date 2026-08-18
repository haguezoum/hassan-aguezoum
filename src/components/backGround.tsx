import { Canvas } from "@react-three/fiber";
import Scene from "./Scene";
import { EffectComposer, Vignette } from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";

const bgStyle: React.CSSProperties = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100vw",
  height: "100vh",
  zIndex: -1,
};

const Background = () => {
  return (
    <Canvas style={bgStyle} className="text-white" frameloop="always">
      <Scene />
      
      <EffectComposer>
        <Vignette
          offset={0.3}          // center size (smaller = tighter focus)
          darkness={0.9}        // strength of dark edges
          eskil={false}
          blendFunction={BlendFunction.NORMAL}
        />
      </EffectComposer>
    </Canvas>
  );
};

export default Background;
