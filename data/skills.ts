// Define the type for a skill (similar to src/cv.d.ts lines 65-70)
export interface Skill {
    name: string;
    icon: string;
    level: string;
    keywords: string[];
  }
  
  // Updated skills data based on your list
  export const skillsData: Skill[] = [
    // Languages
    {
      name: "C++",
      icon: "simple-icons:cplusplus",
      level: "5 years of experience",
      keywords: ["Programming Language", "Systems", "Performance", "Game Development"],
    },
    {
      name: "Java",
      icon: "react-icons:FaJava", // Or "cib:java" if using CoreUI Icons
      level: "5 years of experience",
      keywords: ["Programming Language", "Backend", "Android", "Enterprise"],
    },
    {
      name: "Python",
      icon: "simple-icons:python",
      level: "4 years of experience",
      keywords: ["Programming Language", "Backend", "Data Science", "AI", "Scripting"],
    },
    {
      name: "JavaScript",
      icon: "simple-icons:javascript",
      level: "3 years of experience",
      keywords: ["Programming Language", "Frontend", "Backend", "Web Development", "Node.js"],
    },
    {
      name: "C#",
      icon: "simple-icons:csharp",
      level: "3 years of experience",
      keywords: ["Programming Language", "Backend", ".NET", "Game Development", "Unity"],
    },
    {
      name: "Swift",
      icon: "simple-icons:swift",
      level: "2 years of experience",
      keywords: ["Programming Language", "iOS", "Mobile Development", "Apple"],
    },
    {
      name: "Go",
      icon: "simple-icons:go",
      level: "1 year of experience",
      keywords: ["Programming Language", "Backend", "Cloud", "Concurrency", "Microservices"],
    },
    {
      name: "Lua",
      icon: "simple-icons:lua",
      level: "Intermediate", // Assuming based on context, adjust if needed
      keywords: ["Programming Language", "Scripting", "Game Development", "Embedded"],
    },
    {
      name: "SQL",
      icon: "simple-icons:postgresql", // Using a common DB icon, could use "codicon:database" or others
      level: "Expert",
      keywords: ["Database", "Data Management", "Query Language", "Backend"],
    },
    // Frameworks & Libraries
    {
      name: "Next.js",
      icon: "simple-icons:nextdotjs",
      level: "Intermediate", // Adjust level as needed
      keywords: ["Framework", "Frontend", "React", "Web Development", "SSR"],
    },
    {
      name: "React",
      icon: "simple-icons:react",
      level: "Intermediate", // Adjust level as needed
      keywords: ["Library", "Frontend", "JavaScript", "Web Development", "UI"],
    },
    {
      name: "Node.js",
      icon: "simple-icons:nodedotjs",
      level: "Intermediate", // Adjust level as needed
      keywords: ["Runtime", "Backend", "JavaScript", "Web Development", "API"],
    },
    {
      name: "Tailwind CSS",
      icon: "simple-icons:tailwindcss",
      level: "Intermediate", // Adjust level as needed
      keywords: ["Framework", "CSS", "Frontend", "Web Development", "UI"],
    },
    {
      name: "Spring",
      icon: "simple-icons:spring", // Or "simple-icons:springboot"
      level: "Intermediate", // Adjust level as needed
      keywords: ["Framework", "Backend", "Java", "Enterprise"],
    },
    {
      name: "Flask",
      icon: "simple-icons:flask",
      level: "Intermediate", // Adjust level as needed
      keywords: ["Framework", "Backend", "Python", "Web Development", "API"],
    },
    {
      name: "LangChain",
      icon: "simple-icons:langchain",
      level: "Intermediate", // Adjust level as needed
      keywords: ["AI", "LLM", "Framework", "Python", "Machine Learning"],
    },
    {
      name: "TensorFlow",
      icon: "simple-icons:tensorflow",
      level: "Intermediate", // Adjust level as needed
      keywords: ["AI", "Machine Learning", "Library", "Python", "Deep Learning"],
    },
    {
      name: "Bootstrap",
      icon: "simple-icons:bootstrap",
      level: "Intermediate", // Adjust level as needed
      keywords: ["Framework", "CSS", "Frontend", "Web Development", "UI"],
    },
    // Software & Tools
    {
      name: "AWS",
      icon: "simple-icons:amazonaws",
      level: "Intermediate", // Adjust level as needed
      keywords: ["Cloud", "Infrastructure", "DevOps", "Hosting"],
    },
    {
      name: "Google Cloud", // GCP
      icon: "simple-icons:googlecloud",
      level: "Intermediate", // Adjust level as needed
      keywords: ["Cloud", "Infrastructure", "DevOps", "Hosting"],
    },
    {
      name: "Docker",
      icon: "simple-icons:docker",
      level: "Intermediate", // Adjust level as needed
      keywords: ["Containerization", "DevOps", "Infrastructure", "Deployment"],
    },
    {
      name: "Kubernetes",
      icon: "simple-icons:kubernetes",
      level: "Intermediate", // Adjust level as needed
      keywords: ["Orchestration", "DevOps", "Infrastructure", "Cloud", "Containers"],
    },
    {
      name: "Jupyter", // JupyterNotebook
      icon: "simple-icons:jupyter",
      level: "Intermediate", // Adjust level as needed
      keywords: ["Data Science", "Notebook", "Python", "Analysis"],
    },
    {
      name: "iOS Development", // iOS
      icon: "simple-icons:apple", // Using Apple icon
      level: "Intermediate", // Adjust level as needed
      keywords: ["Mobile Development", "Swift", "Apple", "App Store"],
    },
    {
      name: "Git",
      icon: "simple-icons:git",
      level: "Advanced", // Assuming high proficiency
      keywords: ["Version Control", "DevOps", "Collaboration", "Source Code"],
    },
    {
      name: "Bash",
      icon: "simple-icons:gnubash",
      level: "Intermediate", // Adjust level as needed
      keywords: ["Shell", "Scripting", "Linux", "DevOps", "Terminal"],
    },
    {
      name: "Unity",
      icon: "simple-icons:unity",
      level: "Intermediate", // Adjust level as needed
      keywords: ["Game Development", "Engine", "C#", "3D", "2D"],
    },
  ];