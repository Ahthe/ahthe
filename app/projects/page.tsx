"use client"
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FaGithub, FaExternalLinkAlt } from "react-icons/fa";
import Link from "next/link";
import Container from "@/components/shared/container";

import { Project, projectsData } from "@/data/projects";

const Projects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  const filterCategories = {
    type: ["Data Science / Ai", "Frontend", "Backend", "Cli", "Gamedev"],
    language: ["C++","Go", "Java", "Python", "TypeScript", "JavaScript", "Bash", "Sql"],
    technology: [
      "GraphQl", "gRPC", "Tailwind", "Redis", "PostgreSQL", "React", "D3",
      "Next", "Node", "Docker", "Kubernetes", "Terraform", "SpringBoot",
      "Oracle", "MySql", "MongoDB", "TensorFlow", "Scikitlearn", "Firebase", "aws"
    ]
  };

  useEffect(() => {
    setProjects(projectsData);
  }, []);

  const handleFilterClick = (element: string) => {
    setActiveFilter(activeFilter === element ? null : element);
  };

  const filteredProjects = projects.filter((project) => {
    if (!activeFilter) return true;
    return project.Stack.includes(activeFilter);
  });

  const isTagHighlighted = (tag: string) => activeFilter === tag;

  return (
    <Container size="large">
      <main className="prose prose-neutral dark:prose-invert">
        <div className="mt-6 w-full max-w-3xl">
          <p className="font-medium">
            Learn to build, build to learn
          </p>
          <div className="w-full mt-4 flex flex-col">
            <div className="w-full flex flex-col space-y-4">
              {Object.entries(filterCategories).map(([category, elements]) => (
                <div key={category} className="w-full">
                  <h2 className="text-slate-500 dark:text-slate-400 m-0 pb-0 border-0">
                    Filter by {category}:
                  </h2>
                  <div className="mt-4 flex flex-wrap gap-4">
                    {elements.map((element) => (
                      <div
                        key={element}
                        onClick={() => handleFilterClick(element)}
                        className={`border p-1 text-sm font-medium rounded-md hover:cursor-pointer hover:scale-105 transition-colors
                          ${activeFilter === element 
                            ? 'bg-blue-200 text-blue-700 dark:bg-blue-900 dark:text-blue-300' 
                            : 'bg-slate-200 text-slate-500 hover:text-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:text-slate-200'}`}
                      >
                        {element}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              <hr className="my-6 border-neutral-200 dark:border-neutral-800" />
            </div>
            <div className="w-full grid gap-4">
              {filteredProjects.map((project, index) => (
                <React.Fragment key={index}>
                  <div className="border-b p-2 mt-2 w-full rounded-md flex flex-col md:flex-row gap-4 dark:border-neutral-800">
                    <div className="w-full md:w-1/2 flex flex-wrap order-last md:order-1 gap-2 place-content-start">
                      {project.Stack.map((tech) => (
                        <div
                          key={tech}
                          className={`p-1 text-center text-sm font-medium rounded-md hover:cursor-pointer hover:scale-105 whitespace-nowrap transition-colors
                            ${isTagHighlighted(tech)
                              ? 'bg-blue-200 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                              : 'bg-slate-200 text-slate-500 hover:text-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:text-slate-200'}`}
                          onClick={() => handleFilterClick(tech)}
                        >
                          {tech}
                        </div>
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
                        <motion.a
                          href={project.Link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center text-sm hover:font-semibold transition-colors no-underline"
                          whileHover={{
                            scale: 1.05,
                          }}
                        >
                          <FaGithub className="mr-1" />
                          <span className="underline hover:no-underline">
                            Source
                          </span>
                        </motion.a>

                        {project.Demo && (
                          <motion.a
                            href={project.Demo}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center text-sm hover:font-semibold transition-colors no-underline"
                            whileHover={{
                              scale: 1.05,
                            }}
                          >
                            <FaExternalLinkAlt className="mr-1" />
                            <span className="underline hover:no-underline">
                              Link
                            </span>
                          </motion.a>
                        )}
                        
                        {project.slug && (
                          <Link href={`/projects/${project.slug}`} passHref legacyBehavior>
                            <motion.a
                              className="flex items-center text-sm hover:font-semibold transition-colors no-underline"
                              whileHover={{
                                scale: 1.05,
                              }}
                            >
                              <FaExternalLinkAlt className="mr-1" />
                              <span className="underline hover:no-underline">
                                Read More
                              </span>
                            </motion.a>
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </main>
    </Container>
  );
};

export default Projects;
