import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react"; // Optional: If using Suspense features
import Link from "next/link"; // <-- Import Link

import { getProjectPosts } from "@/app/db/projects"; // Import the new function
import { CustomMDX } from "@/components/mdx";
import Container from "@/components/shared/container";
// Import other components or utils if needed (e.g., formatDate)

// Define the Props type with Promise
type Props = {
  params: Promise<{ slug: string }>;
};

// Optional: Generate Metadata dynamically
export async function generateMetadata({
  params,
}: Props): Promise<Metadata | undefined> {
  const { slug } = await params;
  const project = getProjectPosts().find((p) => p.slug === slug);
  if (!project) {
    return;
  }

  const title = project.metadata.title || "Project Details";
  const description = project.metadata.summary || "Details about the project.";
  // Add more metadata fields as needed

  // Example OpenGraph setup (adjust URL and details)
  // let ogImage = new URL(...);

  return {
    title,
    description,
    // openGraph: { ... },
    // twitter: { ... },
  };
}

// Generate static paths at build time
export async function generateStaticParams() {
  const projects = getProjectPosts();
  return projects.map((project) => ({
    slug: project.slug,
  }));
}

// Make the component async to match Next.js expectations
export default async function ProjectDetailPage({ params }: Props) {
  const { slug } = await params;
  const project = getProjectPosts().find((p) => p.slug === slug);

  if (!project) {
    notFound(); // Show 404 if project MDX file doesn't exist
  }

  return (
    <Container size="large"> {/* Or use a different container/layout */}
      {/* Optional: Add Schema.org JSON-LD like in the blog */}
      {/* <script type="application/ld+json" ... /> */}

      <article className="prose prose-neutral dark:prose-invert mt-8"> {/* Apply prose styling */}
        <h1>{project.metadata.title || "Project Details"}</h1>

        {/* Optional: Display date or other metadata */}
        {/* <div className="text-sm text-neutral-600 dark:text-neutral-400 mb-8">
          {project.metadata.publishedAt && formatDate(project.metadata.publishedAt)}
        </div> */}

        {/* Render the MDX content */}
        <CustomMDX source={project.content} />

        {/* Optional: Add links back, GitHub link, live demo link etc. */}
        <div className="mt-12 flex gap-4">
           {/* Example: Link back to projects list */}
           <Link href="/projects" className="text-sm hover:underline">← Back to Projects</Link>
           {/* You might want to fetch the GitHub link from projectsData or add it to frontmatter */}
           {/* <a href={project.githubLink} target="_blank" rel="noopener noreferrer">View on GitHub</a> */}
        </div>
      </article>
    </Container>
  );
}
