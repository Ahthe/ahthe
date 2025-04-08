import Container from "@/components/shared/container";
import Social from "@/components/social";
import Script from "next/script";
import SkillsSection from "@/components/skills-section";
import EducationSection from "@/components/education-section";

const structuredData = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Syed Ahthesham Alir",
  jobTitle: "Software Engineer",
  worksFor: {
    "@type": "Organization",
    name: "American Muslim Center, Dearborn",
  },
  url: "https://ahthe.vercel.app/",
  sameAs: [
    "https://github.com/ahthe",
    "https://youtube.com/@onurhandev",
    "https://300040543422795776.hello.cv/",
  ],
};

export default function About() {
  const paragraphs = [
    <>
      As a Software Engineer at{" "}
      <span className="font-medium decoration-wavy underline decoration-from-font text-emerald-950 decoration-emerald-500 dark:text-emerald-50 dark:decoration-emerald-400 tracking-tight">
        AMC, Dearborn
      </span>
      , I focus on developing comprehensive applications that deliver value
      across various aspects of software. My expertise bridges the gap between
      design and functionality, reflecting my passion for creating seamless user
      experiences.
    </>,
    `Driven by a love for software development, I thrive on leveraging user
     feedback to enhance products and optimize workflows. I find particular
     excitement in building solutions that streamline processes and contribute
     to impactful projects.`,
    `Outside of work, I enjoy crafting minimalist
     digital tools that address web-related challenges and improve
     development efficiency.`,
  ];

  return (
    <Container
      size="large"
      className="prose prose-zinc dark:prose-invert
      text-zinc-800 dark:text-zinc-200 container animate-enter"
    >
      <p className="my-5 text-zinc-800 dark:text-zinc-200">
        Hi, I&apos;m Ahthesham.
      </p>
      {paragraphs.map((paragraph, index) => (
        <div
          key={index}
          style={
            { "--stagger": index } as React.CSSProperties & {
              [key: string]: number;
            }
          }
        >
          <p className={index === paragraphs.length - 1 ? "mb-8" : ""}>
            {paragraph}
          </p>
          {index === 0 && <hr />}
        </div>
      ))}
      <EducationSection />
      <SkillsSection />
      <Social />
      <Script
        id="structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
    </Container>
  );
}
