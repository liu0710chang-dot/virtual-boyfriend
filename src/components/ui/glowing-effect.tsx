"use client";

import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";

interface GlowingEffectProps {
  children?: React.ReactNode;
  className?: string;
  glowColor?: string;
  intensity?: "low" | "medium" | "high";
  delay?: number;
  spread?: number;
  glow?: boolean;
  disabled?: boolean;
  proximity?: number;
  inactiveZone?: number;
  borderWidth?: number;
}

export function GlowingEffect({
  children,
  className,
  glowColor = "rgba(255, 182, 193, 0.8)",
  intensity = "medium",
  delay = 0,
  spread = 50,
  glow = true,
  disabled = false,
  proximity = 64,
  inactiveZone = 0.01,
  borderWidth = 2,
}: GlowingEffectProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0.5, y: 0.5 });
  const [isHovering, setIsHovering] = useState(false);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current || disabled) return;

      const rect = containerRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;

      const centerX = 0.5;
      const centerY = 0.5;
      const distance = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
      const maxDistance = Math.sqrt(0.5);

      if (distance < maxDistance * (1 - inactiveZone)) {
        setIsHovering(true);
        
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
        
        const animate = () => {
          setMousePosition(prev => ({
            x: prev.x + (x - prev.x) * 0.15,
            y: prev.y + (y - prev.y) * 0.15
          }));
          
          const dx = x - mousePosition.x;
          const dy = y - mousePosition.y;
          if (Math.abs(dx) > 0.001 || Math.abs(dy) > 0.001) {
            animationRef.current = requestAnimationFrame(animate);
          }
        };
        
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setIsHovering(false);
      }
    };

    const handleMouseLeave = () => {
      setIsHovering(false);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    containerRef.current?.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      containerRef.current?.removeEventListener("mouseleave", handleMouseLeave);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [disabled, inactiveZone]);

  const intensityConfig = {
    low: { blur: 15, opacity: 0.5, size: 60 },
    medium: { blur: 25, opacity: 0.7, size: 80 },
    high: { blur: 35, opacity: 0.9, size: 100 },
  };

  const config = intensityConfig[intensity];

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative overflow-hidden rounded-2xl transition-all duration-500",
        disabled && "pointer-events-none",
        className
      )}
      style={{
        animationDelay: `${delay}ms`,
      }}
    >
      {/* 鼠标跟随光圈效果 */}
      {glow && !disabled && (
        <>
          {/* 外层光晕 */}
          <div
            className="absolute pointer-events-none transition-opacity duration-300"
            style={{
              opacity: isHovering ? config.opacity * 0.6 : 0,
              left: `${mousePosition.x * 100}%`,
              top: `${mousePosition.y * 100}%`,
              width: `${config.size * 2}px`,
              height: `${config.size * 2}px`,
              transform: 'translate(-50%, -50%)',
              background: `radial-gradient(circle, ${glowColor}40 0%, ${glowColor}20 30%, transparent 70%)`,
              filter: `blur(${config.blur}px)`,
              borderRadius: '50%',
            }}
          />
          
          {/* 中层光圈 */}
          <div
            className="absolute pointer-events-none transition-opacity duration-300"
            style={{
              opacity: isHovering ? config.opacity : 0,
              left: `${mousePosition.x * 100}%`,
              top: `${mousePosition.y * 100}%`,
              width: `${config.size}px`,
              height: `${config.size}px`,
              transform: 'translate(-50%, -50%)',
              background: `radial-gradient(circle, ${glowColor}60 0%, ${glowColor}30 50%, transparent 70%)`,
              filter: `blur(${config.blur * 0.6}px)`,
              borderRadius: '50%',
            }}
          />
          
          {/* 内层光点 */}
          <div
            className="absolute pointer-events-none transition-opacity duration-200"
            style={{
              opacity: isHovering ? config.opacity : 0,
              left: `${mousePosition.x * 100}%`,
              top: `${mousePosition.y * 100}%`,
              width: `${config.size * 0.3}px`,
              height: `${config.size * 0.3}px`,
              transform: 'translate(-50%, -50%)',
              background: `radial-gradient(circle, ${glowColor} 0%, ${glowColor}80 40%, transparent 70%)`,
              filter: `blur(${config.blur * 0.3}px)`,
              borderRadius: '50%',
            }}
          />
        </>
      )}

      {/* 边框发光 */}
      {glow && !disabled && isHovering && (
        <div
          className="absolute inset-0 rounded-2xl transition-all duration-200 pointer-events-none"
          style={{
            boxShadow: `0 0 ${spread}px ${glowColor}60, inset 0 0 ${spread / 2}px ${glowColor}30`,
            border: `${borderWidth}px solid ${glowColor}80`,
          }}
        />
      )}

      {/* 内容层 */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
