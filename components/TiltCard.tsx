"use client";

import React, { useRef, useState } from "react";

interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  active?: boolean;
  glowColor?: string; // e.g. "rgba(99, 102, 241, 0.4)"
}

export default function TiltCard({
  children,
  className = "",
  onClick,
  active = false,
  glowColor = "rgba(99, 102, 241, 0.3)",
}: TiltCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState("perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)");
  const [glarePosition, setGlarePosition] = useState({ x: 50, y: 50, opacity: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const centerX = width / 2;
    const centerY = height / 2;

    const percentX = (mouseX - centerX) / centerX;
    const percentY = (mouseY - centerY) / centerY;

    const maxRotateX = 12; // Max rotation angle in degrees
    const maxRotateY = 12;

    const rotateX = -percentY * maxRotateX;
    const rotateY = percentX * maxRotateY;

    setTransform(
      `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.03, 1.03, 1.03) translateZ(10px)`
    );

    const glareX = (mouseX / width) * 100;
    const glareY = (mouseY / height) * 100;
    setGlarePosition({ x: glareX, y: glareY, opacity: 0.25 });
  };

  const handleMouseLeave = () => {
    setTransform("perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1) translateZ(0px)");
    setGlarePosition((prev) => ({ ...prev, opacity: 0 }));
  };

  return (
    <div
      ref={cardRef}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform,
        transition: "transform 0.15s cubic-bezier(0.2, 0, 0.2, 1), box-shadow 0.3s ease",
        transformStyle: "preserve-3d",
      }}
      className={`relative cursor-pointer overflow-hidden rounded-3xl transition-all duration-300 ${className}`}
    >
      {/* 3D Dynamic Glare Overlay */}
      <div
        className="pointer-events-none absolute inset-0 z-30 transition-opacity duration-300"
        style={{
          background: `radial-gradient(circle at ${glarePosition.x}% ${glarePosition.y}%, rgba(255, 255, 255, 0.35) 0%, transparent 60%)`,
          opacity: glarePosition.opacity,
        }}
      />

      {/* Active 3D Neon Glow Border effect */}
      {active && (
        <div
          className="pointer-events-none absolute -inset-[1px] rounded-3xl z-10 animate-pulse"
          style={{
            background: `linear-gradient(135deg, ${glowColor}, transparent, ${glowColor})`,
            boxShadow: `0 0 30px ${glowColor}`,
          }}
        />
      )}

      <div className="relative z-20 h-full w-full">{children}</div>
    </div>
  );
}
