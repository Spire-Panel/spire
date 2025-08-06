import { motion } from "motion/react";
import { ReactNode } from "react";

type OnboardingCardProps = {
  children: ReactNode;
  index: number;
  currentIndex: number;
};

export function OnboardingCard({
  children,
  index,
  currentIndex,
}: OnboardingCardProps) {
  const position = (index - currentIndex) * 100;
  const isActive = index === currentIndex;
  const isNext = index === currentIndex + 1;
  const isPrevious = index === currentIndex - 1;

  // Only render the active card and its immediate neighbors for performance
  if (Math.abs(index - currentIndex) > 1) {
    return null;
  }

  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center p-8"
      initial={false}
      animate={{
        x: `${position}%`,
        scale: isActive ? 1 : 0.9,
        opacity: isActive ? 1 : 0.7,
        zIndex: isActive ? 10 : isNext ? 2 : 1,
        transition: {
          type: "spring",
          stiffness: 300,
          damping: 30,
        },
      }}
      exit={{
        x: `${index < currentIndex ? -100 : 100}%`,
        opacity: 0,
        scale: 0.9,
        transition: {
          duration: 0.2,
        },
      }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 30,
      }}
      style={{
        pointerEvents: isActive ? "auto" : "none",
      }}
    >
      <div
        className={`w-full max-w-md bg-card border border-border rounded-2xl shadow-lg overflow-hidden transition-all duration-300 ${
          isActive ? "opacity-100" : "opacity-70"
        }`}
      >
        {children}
      </div>
    </motion.div>
  );
}
