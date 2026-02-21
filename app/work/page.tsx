import Container from "@/components/shared/container";
// import SkillsSection from "@/components/skills-section";

export default function Work() {
  return (
    <Container size="large">
      <main className="prose prose-neutral dark:prose-invert">
        <header>
          <p>
            On a mission to create impactful applications that engage users and
            drive value for businesses. Here&apos;s a summary of my journey so
            far.
          </p>
          <hr className="my-6 border-neutral-200 dark:border-neutral-800" />
        </header>

        <section>

          <article>
            <header>
              <h2 className="font-medium text-xl mb-1 tracking-tighter">
                Captain Jays Fish & Chicken, Dearborn - MI
              </h2>
              <time className="text-neutral-600 dark:text-neutral-400 text-sm">
                AI/Software Engineer, January 2025 — PRESENT
              </time>
            </header>
            <p>
              Engineered production Al systems deployed across 27+ restaurant locations, driving measurable operational efficiency and cost reduction through voice automation, machine learning-based screening, and intelligent compliance tools
            </p>
            <ul>
              <li>
                Projected $1.2M+ in annual labor savings by architecting an Al Virtual Cashier system using Python FastAPI,
                AWS, Twilio Voice API, WebSockets, Redis, and GPT-5 that integrates with NCR Aloha POS to automate phone
                order-taking across 27+ restaurants, reducing staffing requirements by 50% per shift
              </li>

              <li>
                Reduced candidate screening time by 80% by building an Al Voice Interview platform (React, JavaScript, Firebase,
                Vapi Al) using Gemini to autonomously interview and score hundreds of applicants, streamlining hiring workflows
              </li>

              <li>
                Accelerated new hire productivity by 67% (from 3 weeks to 1 week) by developing a self guided onboarding web
                app with React, TypeScript, Nginx, and AWS that generates personalized learning roadmaps based on role
              </li>

              <li>
                Increased compliance from 3% to 95% across all locations by replacing manual checklists with an Al-driven QA
                system featuring automated photo verification and real-time reporting via MS Teams integration
              </li>

            </ul>
          </article>


          <article>
            <header>
              <h2 className="font-medium text-xl mb-1 tracking-tighter">
                American Muslim Center, Dearborn - MI
              </h2>
              <time className="text-neutral-600 dark:text-neutral-400 text-sm">
                Software Engineer - Contract, MARCH 2024 — January 2025
              </time>
            </header>
            <p>
              At the American Muslim Center, Dearborn, I work with a team of developers to build applications that
              adress community challenges  using Next.js, JavaScript, MongoDB, and various APIs. My role focuses on coming up with creative
              ideas and developing these applications alongside my team.
            </p>
            <ul>
              <li>
                Engineered a digital ecosystem for 1,000+ members using React, TypeScript, MongoDB, and Stripe, delivering an
                Event Platform and gamified Educational Portal, managing the full SDLC from design to deployment
              </li>
            </ul>
          </article>

          <article>
            <header>
              <h2 className="font-medium text-xl mb-1 tracking-tighter">
                Headstarter AI, Remote/New York
              </h2>
              <time className="text-neutral-600 dark:text-neutral-400 text-sm">
                Software Engineer Fellow, July 2024 — October 2024
              </time>
            </header>
            <p>
              I joined{" "}
              <a href="https://headstarter.co/" rel="noopener noreferrer">
                Headstarter AI
              </a>{" "}
              , a fellowship with over 3,000 participants, my team and I were the winners. As team lead from July to October 2024, We developed several applications such as using Python and Next.js that reached over 8,000 users.
            </p>
            <ul>
              <li>
                Built and deployed 5+ Al-powered applications using React, Python, OpenAI API, and AWS, collectively serving
                8,000+ users with features including real-time chat, voice interfaces, and intelligent automation
              </li>
              <li>Led engineering teams of 4+ fellows in developing production-grade projects using MVC architecture, Agile
                methodologies, CI/CD pipelines, and microservice design patterns</li>
              <li>
                Coached by Amazon, Bloomberg and Capital One engineers on Agile, CI/CD, Git, and microservice patterns.
              </li>
            </ul>
          </article>

          <article>
            <header>
              <h2 className="font-medium text-xl mb-1 tracking-tighter">
                University of Mount Union, Alliance - OH  </h2>
              <time className="text-neutral-600 dark:text-neutral-400 text-sm">
                Computer Science and Math Tutor, December 2020 — December 2023
              </time>
            </header>
            <p>
              {/* I joined{" "}
              <a href="https://utilify.xyz" rel="noopener noreferrer">
                University of Mount Union
              </a>{" "} */}
              Helped 90% of students improve their grades from 55% to 85-90% through tutoring in programming and math, and by debugging code in JavaScript, Python, C#, and SQL.
            </p>
            <ul>
              <li>
                Raised final grades for 90% of failing students by an average of 35% within one semester, by teaching core data
                structures, algorithms, math concepts and debugging techniques across Java, Python, C++, Go, and SQL
              </li>
            </ul>
          </article>

          <article>
            <header>
              <h2 className="font-medium text-xl mb-1 tracking-tighter">
                ACBSP in VR Technologies - Startup & Research, Alliance - Ohio
              </h2>
              <time className="text-neutral-600 dark:text-neutral-400 text-sm">
                Research Software Engineer, September 2022 — September 2023
              </time>
            </header>
            <p>
              {/* I joined{" "}
              <a href="" rel="noopener noreferrer">
              ACBSP in VR Technologies (Advance Congnative Behavioral Solutions & Pychology )
              </a>{" "} */}
              At the startup, I contributed to a research study by designing interfaces and developing a VR action game in Unity using C# and the Oculus SDK.            </p>
            <ul>
              <li>
                Built a VR action game in Unity using C# and Oculus SDK to improve psychological research studies, targeting
                the prefrontal cortex to reduce user stress and anxiety by 30% via strategic object dismemberment scenarios
              </li>
            </ul>
          </article>

        </section>

        {/* Skills Section */}
        {/* <SkillsSection /> */}

      </main>
    </Container>
  );
}
