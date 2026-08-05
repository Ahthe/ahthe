import type { Metadata } from "next";

import Container from "@/components/shared/container";
import ProjectsExplorer from "@/components/projects-explorer";
import { projectsData } from "@/data/projects";

export const metadata: Metadata = {
  title: "Projects",
  description: "Things I've built.",
};

/**
 * Server component. The data is a static import, so the full list is rendered
 * into the HTML — previously this page held it in useState([]) and populated it
 * from useEffect, which painted an empty list on every visit before hydration.
 * Only the filtering is interactive, so only that lives in a client island.
 */
export default function Projects() {
  return (
    <Container size="large" className="animate-enter">
      <main className="prose prose-neutral dark:prose-invert">
        <ProjectsExplorer projects={projectsData} />
      </main>
    </Container>
  );
}
