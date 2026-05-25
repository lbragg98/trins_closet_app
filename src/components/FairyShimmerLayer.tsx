import { motion, useReducedMotion } from "framer-motion";
import { StyleSheet } from "react-native";

type Sparkle = {
  id: number;
  left: string;
  top: string;
  size: number;
  delay: number;
  duration: number;
  color: string;
};

type GlowOrb = {
  id: number;
  left: string;
  top: string;
  size: number;
  color: string;
  delay: number;
};

const sparkleColors = ["#FFFFFF", "#D8C7FF", "#AFC9FF", "#CFA8FF", "#F7E9FF"];

const sparkles: Sparkle[] = Array.from({ length: 28 }, (_, index) => ({
  id: index,
  left: `${8 + ((index * 29) % 84)}%`,
  top: `${6 + ((index * 47) % 86)}%`,
  size: 2 + (index % 4),
  delay: (index % 9) * 0.35,
  duration: 4.8 + (index % 6) * 0.45,
  color: sparkleColors[index % sparkleColors.length]
}));

const glowOrbs: GlowOrb[] = [
  { id: 1, left: "16%", top: "18%", size: 140, color: "rgba(155, 93, 229, 0.18)", delay: 0 },
  { id: 2, left: "66%", top: "26%", size: 170, color: "rgba(108, 138, 228, 0.16)", delay: 1.2 },
  { id: 3, left: "42%", top: "58%", size: 210, color: "rgba(207, 168, 255, 0.13)", delay: 0.7 },
  { id: 4, left: "72%", top: "72%", size: 130, color: "rgba(255, 255, 255, 0.11)", delay: 1.8 }
];

export function FairyShimmerLayer() {
  const reduceMotion = useReducedMotion();

  return (
    <div style={styles.layer} aria-hidden="true">
      {glowOrbs.map((orb) => (
        <motion.div
          key={orb.id}
          style={{
            ...styles.glowOrb,
            left: orb.left,
            top: orb.top,
            width: orb.size,
            height: orb.size,
            background: orb.color,
            boxShadow: `0 0 ${Math.round(orb.size * 0.45)}px ${orb.color}`
          }}
          animate={
            reduceMotion
              ? undefined
              : {
                  opacity: [0.18, 0.36, 0.2],
                  scale: [0.94, 1.08, 0.98]
                }
          }
          transition={{
            duration: 7,
            delay: orb.delay,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      ))}

      {sparkles.map((sparkle) => (
        <motion.span
          key={sparkle.id}
          style={{
            ...styles.sparkle,
            left: sparkle.left,
            top: sparkle.top,
            width: sparkle.size,
            height: sparkle.size,
            background: sparkle.color,
            boxShadow: `0 0 ${sparkle.size * 4}px ${sparkle.color}`
          }}
          animate={
            reduceMotion
              ? undefined
              : {
                  opacity: [0, 0.72, 0.18, 0],
                  y: [0, -12, -24],
                  x: [0, sparkle.id % 2 === 0 ? 5 : -5, 0],
                  scale: [0.8, 1.3, 0.9]
                }
          }
          transition={{
            duration: sparkle.duration,
            delay: sparkle.delay,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  );
}

const styles = StyleSheet.create({
  layer: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: 2,
    pointerEvents: "none",
    overflow: "hidden"
  },
  sparkle: {
    position: "absolute",
    borderRadius: 999,
    opacity: 0.22
  },
  glowOrb: {
    position: "absolute",
    borderRadius: 999,
    opacity: 0.22
  }
});
