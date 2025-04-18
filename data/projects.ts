// Define project item structure
export interface Project {
  Title: string;
  Desciption: string;
  Stack: string[];
  Link?: string;
  Demo?: string;
  slug?: string;
}

// Projects data
export const projectsData: Project[] = [
  {
    Title: "Your Eyes",
    Desciption: "An innovative app designed to help visually impaired individuals navigate their world with confidence.",
    Stack: ["TypeScript", "NextJS", "YOLOv7", "GPT-4 Vision", "ONNX", "Tailwind", "Frontend", "Backend"],
    Link: "https://github.com/Ahthe/YourEyes",
    Demo: "https://visionary-path.vercel.app/",
    slug: "youreyes"
  },
  {
    Title: "Watch CPR",
    Desciption: "An innovative app designed to help visually impaired individuals navigate their world with confidence.",
    Stack: ["TypeScript", "NextJS", "YOLOv7", "GPT-4 Vision", "ONNX", "Tailwind", "Frontend", "Backend"],
    Link: "https://github.com/Ahthe/YourEyes",
    Demo: "https://visionary-path.vercel.app/",
    slug: "youreyes"
  },
  {
    Title: "fnd",
    Desciption: "fnd is a versatile, intuitive file search utility for both local and remote environments.",
    Stack: ["Go", "Cli"],
    Link: "https://github.com/prudhvideep/fnd"
  },
  {
    Title: "Snippets",
    Desciption: "A Zettelkasten-inspired personal knowledge base featuring Notion-like rich text editing and native code execution support powered by WASM.",
    Stack: [
      "TypeScript",
      "JavaScript",
      "React",
      "Zustand",
      "TailwindCss",
      "PostgreSql",
      "Wasm",
      "Frontend",
      "Backend"
    ],
    Link: "https://github.com/prudhvideep/Snippets",
    Demo: "https://snippets-3fo.pages.dev/"
  },
  {
    Title: "Video Face Recognition",
    Desciption: "An app for detecting faces in a video, built using amazon web services.",
    Stack: [
      "Python",
      "Docker",
      "Terraform",
      "aws",
      "JavaScript",
      "React",
      "TailwindCss",
      "Frontend",
      "Backend",
      "Data Science / Ai"
    ],
    Link: "https://github.com/prudhvideep/Video-Face-Recognition",
    Demo: "https://main.d2g4ycz7ogc8gz.amplifyapp.com/"
  },
  {
    Title: "Brain Tumor Prediction ML",
    Desciption: "This project focuses on the classification of brain tumors from MRI scans using advanced deep learning techniques.",
    Stack: ["Python", "TensorFlow", "Keras", "Xception", "Streamlit", "Machine Learning / AI"],
    Link: "https://github.com/Ahthe/Brain_Tumor_Prediction-ML",
    slug: "wreakeditdown" 
  },
  {
    Title: "Weave Wallet",
    Desciption: "Weave Wallet (GrizzHacks 6 Hackathon Winners)- Exchange crypto locally",
    Stack: ["C++", "Python", "TypeScript", "NextJS", "Tailwind", "Arduino RF", "Frontend", "Backend"],
    Link: "https://devpost.com/software/wavewallet",
    Demo: "https://weave-wallet-home.vercel.app/",
    slug: "weavewallet" 
  },
  {
    Title: "quill",
    Desciption: "A minimal, dependency-free text editor written in C. Quill provides essential features such as search and syntax highlighting.",
    Stack: ["C++"],
    Link: "https://github.com/prudhvideep/quill"
  },

  {
    Title: "Wreaked It Down",
    Desciption: "Wreak It Down, an immersive canvas game with a Multiplayer mode where the action never stops!",
    Stack: ["JavaScript", "ExpressJS", "Socket.io", "Gamedev"],
    Link: "https://github.com/Ahthe/Wreak-IT-Down--Multiplayer",
    Demo: "https://ahthe.github.io/Wreak-IT-Down--Multiplayer/",
    slug: "wreakeditdown" 
  },
  {
    Title: "Rate My Resume",
    Desciption: "Build a tool that helps users evaluate their resumes and improve chances with potential employees",
    Stack: ["TypeScript", "NextJS", "Openai-API"],
    Link: "https://github.com/Ahthe/Wreak-IT-Down--Multiplayer",
    Demo: "https://ahthe.github.io/Wreak-IT-Down--Multiplayer/",
    slug: "wreakeditdown" 
  },
  {
    Title: "Pantry Management System",
    Desciption: "Pantry Management made easier",
    Stack: ["JavaScript", "NextJS", "Firebase"],
    Link: "https://github.com/Ahthe/pantry-management/tree/main"
  },
  {
    Title: "AI Fable Trail",
    Desciption: "An AI-powered choose-your-own-adventure game using OpenAI's GPT and Apache Cassandra to generate storylines based on your choices.",
    Stack: ["Python", "Langchain", "Apache Cassandra's database", "Machine Learning / AI", "Gamedev"],
    Link: "https://github.com/Ahthe/AI-FableTrail",
    slug: "aifable" 
  },
  {
    Title: "Spring Boot User Authentication System",
    Desciption: "This is a simple web application built with Spring MVC and secured using Spring Security.",
    Stack: ["Java", "SpringBoot", "Backend"],
    Link: "https://github.com/Ahthe/Spring-Boot-App-with-User-Authentication"
    // slug: "aifable" 
  },
  {
    Title: "Algorithm Visualizer",
    Desciption: "Used JavaFX to visualize various types of sorting and path-finding algorithms.",
    Stack: ["Java", "Backend"],
    Link: "https://github.com/Ahthe/Algorithm-Visualizer-Java"
    // slug: "aifable" 
  },
  {
    Title: "Pacman Gmae",
    Desciption: "Pacman game built with Java AWT/Swing graphics library.",
    Stack: ["Java", "Gamedev"],
    Link: "https://github.com/Ahthe/Pacman_Game_Java"
    // slug: "aifable" 
  }
  
  
];
