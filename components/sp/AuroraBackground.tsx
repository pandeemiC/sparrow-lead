"use client";

import dynamic from "next/dynamic";
import { memo, useEffect, useState } from "react";

const ShaderLayer = dynamic(() => import("./ShaderLayer"), { ssr: false });

// memo: auth pages re-render on every keystroke, the background never needs to
function AuroraBackground() {
  const [ready, setReady] = useState(false);
  const [still, setStill] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setStill(media.matches);
    sync();
    media.addEventListener("change", sync);
    const timer = setTimeout(() => setReady(true), 250);
    return () => {
      media.removeEventListener("change", sync);
      clearTimeout(timer);
    };
  }, []);

  return (
    <div className="sp-aurora" aria-hidden>
      <div className="blobs">
        <div className="blob b1" />
        <div className="blob b2" />
      </div>
      <div className={`shader ${ready ? "ready" : ""}`}>
        <ShaderLayer still={still} />
      </div>
      <div className="grid" />
      <div className="vignette" />
      <div className="grain" />
    </div>
  );
}

export default memo(AuroraBackground);
