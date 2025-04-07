export interface EducationItem {
    institution: string;
    url?: string; 
    area: string;
    location?: string; 
    startDate: string; 
    endDate?: string; 
   }
  
  export interface AchievementItem {
    name: string;
    location?: string; 
    url?: string; 
  }
  
 
  export const educationData: EducationItem[] = [
    {
      institution: "University Of Mount Union",
      area: "Bachelor of Science in Computer Science — Dean's List",
      location: "Alliance, OH",
      startDate: "2020-01-12",
      endDate: "2024-05-31",
    },
  ];
  
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