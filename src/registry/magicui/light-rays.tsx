"use client";

import React, { useEffect, useState, type CSSProperties } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

export interface LightRaysProps extends React.HTMLAttributes<HTMLDivElement> {
  count?: number;
  color?: string;
  blur?: number;
  speed?: number;
  length?: string;
  opacity?: number;
}

type LightRay = {
  id: string;
  left: number;
  rotate: number;
  width: number;
  swing: number;
  delay: number;
  duration: number;
  intensity: number;
};

const createRays = (count: number, cycle: number, maxOpacity: number): LightRay[] => {
  if (count <= 0) return [];

  return Array.from({ length: count }, (_, index) => {
    const left = 6 + Math.random() * 88;
    const rotate = -28 + Math.random() * 56;
    const width = 160 + Math.random() * 180;
    const swing = 0.8 + Math.random() * 1.8;
    const delay = Math.random() * cycle;
    const duration = cycle * (0.75 + Math.random() * 0.5);
    const intensity = Math.min(1, Math.max(0.1, (0.5 + Math.random() * 0.5) * maxOpacity));

    return {
      id: `${index}-${Math.round(left * 10)}`,
      left,
      rotate,
      width,
      swing,
      delay,
      duration,
      intensity,
    };
  });
};

const Ray = ({
  left,
  rotate,
  width,
  swing,
  delay,
  duration,
  intensity,
}: LightRay) => {
  return (
    <motion.div
      className="pointer-events-none absolute -top-[12%] left-[var(--ray-left)] h-[var(--light-rays-length)] w-[var(--ray-width)] origin-top -translate-x-1/2 rounded-full opacity-0 mix-blend-normal dark:mix-blend-screen blur-[var(--light-rays-blur)]"
      style={
        {
          "--ray-left": `${left}%`,
          "--ray-width": `${width}px`,
          background:
            "linear-gradient(to bottom, color-mix(in srgb, var(--light-rays-color) 75%, transparent), transparent)",
        } as CSSProperties
      }
      initial={{ rotate: rotate }}
      animate={{
        opacity: [0, intensity, 0],
        rotate: [rotate - swing, rotate + swing, rotate - swing],
      }}
      transition={{
        duration: duration,
        repeat: Infinity,
        ease: "easeInOut",
        delay: delay,
        repeatDelay: duration * 0.1,
      }}
    />
  );
};

export const LightRays = React.forwardRef<HTMLDivElement, LightRaysProps>(
  (
    {
      className,
      style,
      count = 7,
      color = "rgba(160, 210, 255, 0.2)",
      blur = 36,
      speed = 14,
      length = "70vh",
      opacity = 0.65,
      ...props
    },
    ref
  ) => {
    const [rays, setRays] = useState<LightRay[]>([]);
    const cycleDuration = Math.max(speed, 0.1);

    useEffect(() => {
      setRays(createRays(count, cycleDuration, opacity));
    }, [count, cycleDuration, opacity]);

    return (
      <div
        ref={ref}
        className={cn(
          "pointer-events-none absolute inset-0 isolate overflow-hidden rounded-[inherit]",
          className
        )}
        style={
          {
            "--light-rays-color": color,
            "--light-rays-blur": `${blur}px`,
            "--light-rays-length": length,
            ...style,
          } as CSSProperties
        }
        {...props}
      >
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            aria-hidden
            className="absolute inset-0 opacity-60 pointer-events-none"
            style={
              {
                background:
                  "radial-gradient(circle at 20% 15%, color-mix(in srgb, var(--light-rays-color) 45%, transparent), transparent 70%)",
              } as CSSProperties
            }
          />
          <div
            aria-hidden
            className="absolute inset-0 opacity-60 pointer-events-none"
            style={
              {
                background:
                  "radial-gradient(circle at 80% 10%, color-mix(in srgb, var(--light-rays-color) 35%, transparent), transparent 75%)",
              } as CSSProperties
            }
          />
          {rays.map((ray) => (
            <Ray key={ray.id} {...ray} />
          ))}
        </div>
      </div>
    );
  }
);

LightRays.displayName = "LightRays";
