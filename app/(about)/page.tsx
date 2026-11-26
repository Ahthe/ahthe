import Container from "@/components/shared/container";
import Link from "next/link";
import Social from "@/components/social";
import Script from "next/script";
import SkillsSection from "@/components/skills-section";
import EducationSection from "@/components/education-section";

const structuredData = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: " Syed Ahthesham Ali",
  jobTitle: "Software Engineer (Forward Deployed)",
  worksFor: {
    "@type": "Organization",
    name: "Captain Jay's Corporate",
  },
  url: "https://ahthe.vercel.app/",
  sameAs: [
    "https://github.com/ahthe",
    "https://300040543422795776.hello.cv/",
  ],
};

export default function About() {
  return (
    <Container
      size="large"
      className="prose prose-zinc dark:prose-invert
      text-zinc-800 dark:text-zinc-200 container animate-enter"
    >
      <p className="my-5 text-zinc-800 dark:text-zinc-200">
        Hi, I&apos;m Ahthesham.
      </p>
      <p className="leading-relaxed">
        I work as a Software Engineer at{" "}
        <span className="font-medium decoration-wavy underline decoration-from-font text-emerald-950 decoration-emerald-500 dark:text-emerald-50 dark:decoration-emerald-400 tracking-tight">
          Captain Jay&apos;s Corporate
        </span>{" "}
        in Dearborn, Michigan. I find where software and AI can cut costs and
        manual work across 27 restaurants and 462 employees, scope each project
        with operations leaders, write the system design, then ship the FastAPI
        and PostgreSQL backend and Next.js app.
      </p>
      <p className="mt-6 leading-relaxed">
        Much of that work is agentic AI pipelines that take over tasks people
        used to do by hand. One grades store audit photos against standards I
        set with the CEO, ranks all 27 stores, and drafts coaching plans, saving
        our director of operations 13+ hours a week. Another is our AI phone
        ordering agent, where I raised order accuracy from 50% to 90% (
        <Link href="/blog/ai-phone-ordering-50-to-90" className="underline">
          how I did it
        </Link>
        ).
      </p>
      <p className="mt-6 mb-8 leading-relaxed">
        I like planning and building things and figuring out how systems work.
        Before writing code, I go into stores and talk with the people who use
        the software. My interests are backend systems, applied AI, and
        robotics.
      </p>
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
