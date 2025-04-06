import React from 'react';
import * as SiIcons from 'react-icons/si';
import * as RiIcons from 'react-icons/ri';
import * as MdiIcons from 'react-icons/md';
// Add other icon sets if needed (e.g., Fa, Di, etc.)
import * as FaIcons from 'react-icons/fa';

// Combine all icons into one object for easier lookup
const allIcons = {
  ...SiIcons,
  ...RiIcons,
  ...MdiIcons,
  ...FaIcons,
};

// Helper function to format the icon name for react-icons lookup
// e.g., "simple-icons:html5" -> "SiHtml5"
// e.g., "ri:css3-fill" -> "RiCss3Fill"
// e.g., "mdi:tailwind" -> "MdTailwind"
const formatIconName = (iconName: string): string | null => {
  const parts = iconName.split(':');
  if (parts.length !== 2) return null;

  const [prefix, name] = parts;
  const formattedPrefix = prefix.split('-').map(p => p.charAt(0).toUpperCase() + p.slice(1)).join('');
  const formattedName = name.split('-').map(n => n.charAt(0).toUpperCase() + n.slice(1)).join('');

  // Map known prefixes to react-icons prefixes
  let reactIconsPrefix = '';
  if (formattedPrefix === 'SimpleIcons') reactIconsPrefix = 'Si';
  else if (formattedPrefix === 'Ri') reactIconsPrefix = 'Ri';
  else if (formattedPrefix === 'Mdi') reactIconsPrefix = 'Md';
  // Add more mappings if you use other icon sets
  else if (formattedPrefix === 'Fa') reactIconsPrefix = 'Fa';
  else return null; // Or handle unknown prefixes

  return `${reactIconsPrefix}${formattedName}`;
};

interface SkillIconProps {
  iconName: string;
  size?: number;
  className?: string;
}

const SkillIcon: React.FC<SkillIconProps> = ({ iconName, size = 16, className }) => {
  const componentName = formatIconName(iconName);

  if (!componentName) {
    console.warn(`Could not format icon name: ${iconName}`);
    return null; // Return null or a default icon if formatting fails
  }

  const IconComponent = (allIcons as any)[componentName];

  if (!IconComponent) {
    console.warn(`Icon component not found for: ${componentName} (original: ${iconName})`);
    return null; // Return null or a default icon if not found
  }

  return <IconComponent size={size} className={className} />;
};

export default SkillIcon;