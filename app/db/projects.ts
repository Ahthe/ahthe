import fs from "fs";
import path from "path";

// Re-use or redefine Metadata type if needed, or create a specific ProjectMetadata type
type Metadata = {
  title: string; // Ensure frontmatter in project MDX uses 'title'
  publishedAt?: string; // Optional date
  summary?: string; // Optional summary for the detail page
  // Add any other project-specific metadata fields you need
};

// --- Copy/Adapt functions from app/db/blog.ts ---

function parseFrontmatter(fileContent: string) {
  let frontmatterRegex = /---\s*([\s\S]*?)\s*---/;
  let match = frontmatterRegex.exec(fileContent);
  // Handle cases where frontmatter might be missing
  if (!match || !match[1]) {
     return { metadata: {} as Metadata, content: fileContent };
  }
  let frontMatterBlock = match[1];
  let content = fileContent.replace(frontmatterRegex, "").trim();
  let frontMatterLines = frontMatterBlock.trim().split("\n");
  let metadata: Partial<Metadata> = {};

  frontMatterLines.forEach((line) => {
    let [key, ...valueArr] = line.split(": ");
    if (key && valueArr.length > 0) { // Ensure key and value exist
        let value = valueArr.join(": ").trim();
        value = value.replace(/^['"](.*)['"]$/, "$1"); // Remove quotes
        // Add specific handling if needed (like for keywords array in blog)
        metadata[key.trim()] = value;
    }
  });

  return { metadata: metadata as Metadata, content };
}

function getMDXFiles(dir: string): string[] {
  try {
     return fs.readdirSync(dir).filter((file) => path.extname(file) === ".mdx");
  } catch (error) {
     console.error(`Error reading directory ${dir}:`, error);
     return []; // Return empty array on error
  }
}

function readMDXFile(filePath: string) {
  try {
     let rawContent = fs.readFileSync(filePath, "utf-8");
     return parseFrontmatter(rawContent);
  } catch (error) {
     console.error(`Error reading file ${filePath}:`, error);
     // Return default structure on error to prevent crashes downstream
     return { metadata: {} as Metadata, content: "" };
  }
}

// Optional: Adapt getReadingTime if you want it for projects
// function getReadingTime(content) { ... }

function getMDXData(dir: string) {
  let mdxFiles = getMDXFiles(dir);
  return mdxFiles.map((file) => {
    let { metadata, content } = readMDXFile(path.join(dir, file));
    let slug = path.basename(file, path.extname(file));
    // let readingTime = getReadingTime(content); // Optional
    return {
      metadata,
      slug,
      content,
      // readingTime, // Optional
    };
  }).filter(project => project.metadata && project.content); // Filter out projects that failed to load
}

// --- Export the function to get project data ---
export function getProjectPosts() {
  // Adjust the path to your projects content directory
  return getMDXData(path.join(process.cwd(), "content", "projects"));
}