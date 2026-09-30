"use client";

import { useEffect, useState } from "react";

export default function BackgroundEffect() {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    setParticles(
      Array.from({ length: 20 }, (_, i) => ({
        id: i,
        delay: Math.random() * 10,
        duration: 15 + Math.random() * 10,
        size: 2 + Math.random() * 4,
        left: Math.random() * 100,
      })),
    );
  }, []);

  return (
    <div className="bg-effect">
      <div className="gradient-bg" />
      <div className="grid-pattern" />
      <div className="floating-shapes">
        <div className="shape shape-1" />
        <div className="shape shape-2" />
        <div className="shape shape-3" />
        <div className="shape shape-4" />
        <div className="shape shape-5" />
      </div>
      <div className="bg-particles">
        {particles.map((p) => (
          <div key={p.id} style={{
            position: "absolute",
            bottom: "-20px",
            left: `${p.left}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            background: "color-mix(in srgb, var(--globe-accent) 10%, transparent)",
            borderRadius: "50%",
            animation: `float ${p.duration}s linear infinite`,
            animationDelay: `${p.delay}s`,
          }} />
        ))}
      </div>
    </div>
  );
}
