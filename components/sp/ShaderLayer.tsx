"use client";

import { ShaderGradient, ShaderGradientCanvas } from "@shadergradient/react";

export default function ShaderLayer({ still }: { still: boolean }) {
  return (
    <ShaderGradientCanvas
      style={{ position: "absolute", inset: 0 }}
      pixelDensity={1}
      fov={45}
      pointerEvents="none"
      lazyLoad={false}
    >
      <ShaderGradient
        control="props"
        type="plane"
        animate={still ? "off" : "on"}
        uSpeed={0.12}
        uStrength={4}
        uDensity={1.3}
        uFrequency={5.5}
        uAmplitude={1}
        uTime={0}
        positionX={-1.4}
        positionY={0}
        positionZ={0}
        rotationX={0}
        rotationY={10}
        rotationZ={50}
        color1="#ff2438"
        color2="#7e0f1b"
        color3="#2a060c"
        brightness={0.9}
        reflection={0.1}
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
