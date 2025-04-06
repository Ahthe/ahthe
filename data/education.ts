// Define types (similar to src/cv.d.ts lines 94-103)
export interface EducationItem {
    institution: string;
    url?: string; // Optional URL
    area: string;
    location?: string; // City, State for institution
    startDate: string; // Format: YYYY-MM-DD
    endDate?: string; // Format: YYYY-MM-DD, optional for ongoing
    // studyType?: string; // Not used in the React component currently
    // score?: string; // Not used in the React component currently
    // courses?: string[]; // Not used in the React component currently
  }
  
  // Renamed from AwardsItem and updated fields
  export interface AchievementItem {
    name: string;
    location?: string; // City, State for achievement
    url?: string; // Optional URL for proof/details
  }
  
  // Populate with your education details
  export const educationData: EducationItem[] = [
    {
      institution: "University Of Mount Union",
      area: "Bachelor of Science in Computer Science — Dean's List",
      location: "Alliance, OH",
      startDate: "2020-01-12",
      endDate: "2024-05-31",
    },
    // Add other education entries here if you have more
  ];
  
  // Renamed from certificatesData and populated with new achievements
  export const achievementsData: AchievementItem[] = [
    {
      name: "Launched an application with 8000+ users",
      location: "Dearborn, MI - 2024",
      // url: "Optional: Link to app or proof"
    },
    {
      name: "Headstarter Fellowship: Won 3rd place as team leader among 3000+ teams",
      location: "NYC - 2024",
      // url: "Optional: Link to announcement or proof"
    },
    {
      name: "Won the First Place at GrizzHacks Hackathon for the Best UI/UX among 30+ teams",
      location: "Rochester, MI - 2024",
      // url: "Optional: Link to hackathon result or proof"
    },
  ];