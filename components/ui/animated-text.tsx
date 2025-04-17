import { motion } from "framer-motion";
import type React from "react";
import { cn } from "@/lib/utils";

const DURATION = 0.25;
const STAGGER = 0.025;

interface AnimatedTextProps {
  children: string;
  href: string;
  className?: string;
  isActive?: boolean;
}

export const AnimatedText: React.FC<AnimatedTextProps> = ({
  children,
  href,
  className = "",
  isActive = false,
}) => {
  return (
    <motion.a
      initial="initial"
      whileHover="hovered"
      href={href}
      className={cn(
        "relative block w-fit leading-[1.2rem] rounded-lg p-0 text-base text-primary/90 whitespace-nowrap sm:px-2 sm:py-1",
        isActive ? "font-bold" : "font-normal",
        className
      )}
    >
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-px bg-accent"
        variants={{
          initial: { width: "0%" },
          hovered: { width: "100%" },
        }}
        transition={{ duration: DURATION, ease: "easeInOut" }}
      />

      <span className="relative inline-block cursor-pointer">
        {children.split("").map((l, i) => (
          <span key={i} className="relative inline-block overflow-hidden">
            <motion.span
              variants={{
                initial: { y: 0 },
                hovered: { y: "-100%" },
              }}
              transition={{
                duration: DURATION,
                ease: "easeInOut",
                delay: i * STAGGER,
              }}
              className="block"
            >
              {l}
            </motion.span>
            <motion.span
              variants={{
                initial: { y: "100%" },
                hovered: { y: "0%" },
              }}
              transition={{
                duration: DURATION,
                ease: "easeInOut",
                delay: i * STAGGER,
              }}
              className="block absolute left-0 top-0"
            >
              {l}
            </motion.span>
          </span>
        ))}
      </span>
    </motion.a>
  );
};
