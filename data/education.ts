// Define types (similar to src/cv.d.ts lines 94-103)
export interface EducationItem {
    institution: string;
    url?: string; // Optional URL
    area: string;
    startDate: string; // Format: YYYY-MM-DD
    endDate?: string; // Format: YYYY-MM-DD, optional for ongoing
    // studyType?: string; // Not used in the React component currently
    // score?: string; // Not used in the React component currently
    // courses?: string[]; // Not used in the React component currently
  }
  
  export interface AwardsItem {
    name: string;
    date: string; // Format: YYYY-MM-DD
    issuer: string;
    url?: string; // Optional URL
  }
  
  // Populate with your education details
  export const educationData: EducationItem[] = [
    {
      institution: "University Of Mount Union",
      area: "Bachelor of Science in Computer Science — Dean’s List",
      startDate: "2020-01-01", 
      endDate: "2024-05-31", 
    },
    // Add other education entries here if you have more
  ];
  

  export const certificatesData: AwardsItem[] = [
    {
      name: "React Fundamentals",
      date: "2023-10-15",
      issuer: "Online Course Provider",
      url: "Optional: Link to certificate"
    }
    
  ];