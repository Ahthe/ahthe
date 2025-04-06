import React from 'react';
import { skillsData, Skill } from '@/data/skills'; // Adjust path if needed
import SkillIcon from '../components/ui/skill-icon'; // Adjust path if needed

const SkillsSection: React.FC = () => {
  return (
    <section className="mt-12"> {/* Add margin-top */}
      <h2 className="font-medium text-xl mb-4 tracking-tighter">My Skills</h2>
      <ul className="inline-flex flex-wrap gap-3"> {/* Adjusted gap slightly */}
        {skillsData.map((skill) => (
          <li
            key={skill.name}
            title={skill.level} // Tooltip for skill level
            className="flex items-center gap-1.5 rounded-md border border-neutral-200/80 dark:border-neutral-700/60 bg-neutral-100 dark:bg-neutral-800/50 px-2 py-1 text-xs text-neutral-700 dark:text-neutral-300 shadow-sm" // Adjusted styles slightly for React theme
          >
            {skill.icon && <SkillIcon iconName={skill.icon} size={20} />}
            <span>{skill.name}</span>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default SkillsSection;
