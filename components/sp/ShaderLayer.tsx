"use client";

import { memo } from "react";
import { ShaderGradient, ShaderGradientCanvas } from "@shadergradient/react";

// kept outside the component so the canvas never gets a "new" style object
const CANVAS_STYLE = { position: "absolute", inset: 0 } as const;

// memo so typing in a form (parent re-render) doesn't touch the webgl scene
function ShaderLayer({ still }: { still: boolean }) {
  return (
    <ShaderGradientCanvas
      style={CANVAS_STYLE}
      pixelDensity={0.6}
      fov={45}
      pointerEvents="none"
      lazyLoad={false}
    >
      <ShaderGradient
        control="props"
        type="plane"
        animate={still ? "off" : "on"}
        uSpeed={0.07}
        uStrength={2.2}
        uDensity={0.9}
        uFrequency={3.5}
        uAmplitude={1}
        uTime={0}
        positionX={-1.4}
        positionY={0}
        positionZ={0}
        rotationX={0}
        rotationY={10}
        rotationZ={50}
        color1="#c81d2e"
        color2="#5e0b15"
        color3="#1a0408"
        brightness={0.7}
        reflection={0.05}
        cAzimuthAngle={180}
        cPolarAngle={90}
        cDistance={3.6}
        cameraZoom={1}
        lightType="3d"
        grain="off"
      />
    </ShaderGradientCanvas>
  );
}

export default memo(ShaderLayer);
