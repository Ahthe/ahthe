import React from "react";
import type { IconType } from "react-icons";
import {
  SiApple,
  SiBootstrap,
  SiCplusplus,
  SiDocker,
  SiDotnet,
  SiFlask,
  SiGit,
  SiGnubash,
  SiGo,
  SiGooglecloud,
  SiJavascript,
  SiJupyter,
  SiKubernetes,
  SiLangchain,
  SiNextdotjs,
  SiNodedotjs,
  SiPostgresql,
  SiPython,
  SiReact,
  SiRust,
  SiSpring,
  SiSwift,
  SiTailwindcss,
  SiTensorflow,
  SiUnity,
} from "react-icons/si";
import { FaAws, FaJava } from "react-icons/fa";

/**
 * Explicit registry, keyed by the `icon` field in data/skills.ts.
 *
 * This replaces a `import * as SiIcons from "react-icons/si"` over four icon
 * sets merged into one lookup object. That approach defeated tree-shaking and,
 * worse, failed silently: an unknown name returned null, so Java, C#, and AWS
 * rendered as empty chips while the build only logged a warning. A missing key
 * here is a TypeScript error instead.
 */
const ICONS: Record<string, IconType> = {
  "simple-icons:cplusplus": SiCplusplus,
  "fa:java": FaJava,
  "simple-icons:python": SiPython,
  "simple-icons:javascript": SiJavascript,
  // react-icons has no C# glyph — SiSharp is Sharp Corporation, not C#.
  // .NET is the closest correct mark for the ecosystem.
  "simple-icons:dotnet": SiDotnet,
  "simple-icons:rust": SiRust,
  "simple-icons:swift": SiSwift,
  "simple-icons:go": SiGo,
  "simple-icons:postgresql": SiPostgresql,
  "simple-icons:nextdotjs": SiNextdotjs,
  "simple-icons:react": SiReact,
  "simple-icons:nodedotjs": SiNodedotjs,
  "simple-icons:tailwindcss": SiTailwindcss,
  "simple-icons:spring": SiSpring,
  "simple-icons:flask": SiFlask,
  "simple-icons:langchain": SiLangchain,
  "simple-icons:tensorflow": SiTensorflow,
  "simple-icons:bootstrap": SiBootstrap,
  "fa:aws": FaAws,
  "simple-icons:googlecloud": SiGooglecloud,
  "simple-icons:docker": SiDocker,
  "simple-icons:kubernetes": SiKubernetes,
  "simple-icons:jupyter": SiJupyter,
  "simple-icons:apple": SiApple,
  "simple-icons:git": SiGit,
  "simple-icons:gnubash": SiGnubash,
  "simple-icons:unity": SiUnity,
};

interface SkillIconProps {
  iconName: string;
  size?: number;
  className?: string;
}

const SkillIcon: React.FC<SkillIconProps> = ({
  iconName,
  size = 16,
  className,
}) => {
  const IconComponent = ICONS[iconName.toLowerCase()];

  if (!IconComponent) {
    console.warn(`No icon registered for "${iconName}" (components/ui/skill-icon.tsx)`);
    return null;
  }

  return <IconComponent size={size} className={className} />;
};

export default SkillIcon;
