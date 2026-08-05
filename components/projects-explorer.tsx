"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { FaGithub, FaExternalLinkAlt } from "react-icons/fa";

import type { Project } from "@/data/projects";

const FILTER_CATEGORIES = {
  type: [
    "Machine Learning / AI",
    "Frontend",
    "Backend",
    "Cli",
    "Gamedev",
    "IOS",
  ],
  language: [
    "C++",
    "Java",
    "Python",
    "C#",
    "Swift",
    "GO",
    "TypeScript",
    "JavaScript",
    "Lua",
    "Bash",
    "SQL",
  ],
  technology: [
    "AWS",
    "Google Cloud",
    "Firebase",
    "Langchain",
    "Xcode",
    "PostgreSQL",
    "React",
    "Tailwind",
    "NextJS",
    "NodeJS",
    "Docker",
    "Kubernetes",
    "SpringBoot",
    "MySql",
    "MongoDB",
    "TensorFlow",
    "Scikitlearn",
    "JupyterNotebook",
    "iOS Bootstrap",
    "Git",
    "Bash",
    "Unity",
  ],
};

const chipClass = (active: boolean) =>
  [
    "p-1 text-center text-sm font-medium rounded-md cursor-pointer whitespace-nowrap",
    "transition-colors [transition-duration:var(--dur-fast)] [transition-timing-function:var(--ease-standard)]",
    active
      ? "bg-blue-200 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
      : "bg-slate-200 text-slate-500 hover:text-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:text-slate-200",
  ].join(" ");

export default function ProjectsExplorer({
  projects,
}: {
  projects: Project[];
}) {
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  const toggleFilter = (element: string) =>
    setActiveFilter((current) => (current === element ? null : element));

  const filteredProjects = useMemo(
    () =>
      activeFilter
        ? projects.filter((project) => project.Stack.includes(activeFilter))
        : projects,
    [projects, activeFilter]
  );

  return (
    <div className="mt-6 w-full max-w-3xl">
      <p className="font-medium">Learn to build, build to learn</p>

      <div className="w-full mt-4 flex flex-col">
        <div className="w-full flex flex-col space-y-4">
          {Object.entries(FILTER_CATEGORIES).map(([category, elements]) => (
            <div key={category} className="w-full">
              <h2 className="text-slate-500 dark:text-slate-400 m-0 pb-0 border-0">
                Filter by {category}:
              </h2>
              <div className="mt-4 flex flex-wrap gap-4">
                {elements.map((element) => (
                  <button
                    key={element}
                    type="button"
                    aria-pressed={activeFilter === element}
                    onClick={() => toggleFilter(element)}
                    className={`border ${chipClass(activeFilter === element)}`}
                  >
                    {element}
                  </button>
                ))}
              </div>
            </div>
          ))}
          <hr className="my-6 border-neutral-200 dark:border-neutral-800" />
        </div>

        {activeFilter && (
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-0 mb-4">
            {filteredProjects.length}{" "}
            {filteredProjects.length === 1 ? "project" : "projects"} tagged{" "}
            <span className="font-medium">{activeFilter}</span>.{" "}
            <button
              type="button"
              onClick={() => setActiveFilter(null)}
              className="underline hover:no-underline"
            >
              Clear filter
            </button>
          </p>
        )}

        {filteredProjects.length === 0 ? (
          <p className="text-neutral-600 dark:text-neutral-400">
            No projects tagged <span className="font-medium">{activeFilter}</span> yet.
          </p>
        ) : (
          <div className="w-full grid gap-4">
            {filteredProjects.map((project, index) => (
              <div
                key={`${project.Title}-${index}`}
                className="border-b p-2 mt-2 w-full rounded-md flex flex-col md:flex-row gap-4 dark:border-neutral-800"
              >
                <div className="w-full md:w-1/2 flex flex-wrap order-last md:order-1 gap-2 place-content-start">
                  {project.Stack.map((tech) => (
                    <button
                      key={tech}
                      type="button"
                      onClick={() => toggleFilter(tech)}
                      className={chipClass(activeFilter === tech)}
                    >
                      {tech}
                    </button>
                  ))}
                </div>

                <div className="w-full md:w-1/2 flex flex-col space-y-2">
                  <h3 className="text-xl font-semibold max-w-full truncate mt-0 mb-1 border-0">
                    {project.Title}
                  </h3>
                  <p className="font-normal overflow-hidden text-ellipsis max-h-20 break-words line-clamp-3 mt-0">
                    {project.Desciption}
                  </p>

                  <div className="flex flex-row justify-start gap-4 mt-2">
                    {project.Link && (
                      <a
                        href={project.Link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-sm no-underline hover:font-medium transition-colors [transition-duration:var(--dur-fast)] [transition-timing-function:var(--ease-standard)]"
                      >
                        <FaGithub className="mr-1" />
                        <span className="underline hover:no-underline">
                          Source
                        </span>
                      </a>
                    )}

                    {project.Demo && (
                      <a
                        href={project.Demo}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-sm no-underline hover:font-medium transition-colors [transition-duration:var(--dur-fast)] [transition-timing-function:var(--ease-standard)]"
                      >
                        <FaExternalLinkAlt className="mr-1" />
                        <span className="underline hover:no-underline">Link</span>
                      </a>
                    )}

                    {project.slug && (
                      <Link
                        href={`/projects/${project.slug}`}
                        className="flex items-center text-sm no-underline hover:font-medium transition-colors [transition-duration:var(--dur-fast)] [transition-timing-function:var(--ease-standard)]"
                      >
                        <FaExternalLinkAlt className="mr-1" />
                        <span className="underline hover:no-underline">
                          Read More
                        </span>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
