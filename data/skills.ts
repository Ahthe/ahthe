// Define the type for a skill (similar to src/cv.d.ts lines 65-70)
export interface Skill {
    name: string;
    icon: string;
    level: string;
    keywords: string[];
  }
  
  // Paste and export the skills data from your cv.json
  export const skillsData: Skill[] = [
    {
      "name": "HTML",
      "icon": "simple-icons:html5",
      "level": "Intermediate",
      "keywords": [
        "Web Development",
        "Frontend"
      ]
    },
    {
      "name": "CSS",
      "icon": "ri:css3-fill",
      "level": "Intermediate",
      "keywords": [
        "Web Development",
        "Frontend",
        "Responsive Design"
      ]
    },
    {
      "name": "JavaScript",
      "icon": "simple-icons:javascript",
      "level": "Expert",
      "keywords": [
        "Web Development",
        "Frontend",
        "Backend",
        "Fullstack"
      ]
    },
    // ... include all other skills from your cv.json
  ];