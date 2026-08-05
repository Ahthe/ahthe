import Container from "@/components/shared/container";
// import SkillsSection from "@/components/skills-section";

export default function Work() {
  return (
    <Container size="large" className="animate-enter">
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
                Software Engineer (Forward Deployed), January 2025 — PRESENT
              </time>
            </header>
            <p>
              Engineered production AI systems deployed across 27+ restaurant
              locations, driving measurable operational efficiency and cost
              reduction through voice automation, an internal training platform,
              and AI-assisted store audits.
            </p>
            <ul>
              <li>
                Identified phone-order abandonment as the largest revenue leak during peak promotions, then led vendor evaluation
                and the 27-location rollout of a Voice AI phone-agent platform running 50 concurrent agents, generating an
                estimated $865K in annual labor savings
              </li>

              <li>
                Drove cross-functional delivery across three external engineering teams during a 9-month NCR Aloha POS
                integration, tracing JSON payloads to resolve item-ID and API errors causing zero-priced and missing menu items            
              </li>

              <li>
                Rebuilt the voice agent’s prompt and conversation flow with the vendor’s senior engineer to eliminate hallucinated
                orders on the chain’s highest-volume weekly promotion, raising order accuracy to 95% company-wide
              </li>

              <li>
                 Reduced new-hire ramp time from 3 weeks to 1 week by building Captain Jay’s University, an LMS in Next.js,
                TypeScript, FastAPI, PostgreSQL, and Docker, now deployed company-wide to all 315 employees across 27
                locations, serving 260+ lessons, server-scored certification exams, and manager analytics
              </li>

              <li>
                Redesigned store audits through stakeholder interviews with district managers and staff, then built an AI-assisted
                platform that raised normalized scores from 48–60% to 73–82% for 27 locations using Next.js, TypeScript, FastAPI,
                PostgreSQL, Cloudflare R2, GPT-4o Vision for photo verification, and Power Automate for Teams  
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
                Developed and deployed 5+ AI-powered applications using React, Python, OpenAI API, DynamoDB, and AWS,
                serving 8,000+ users with real-time chat, voice interfaces, and intelligent automation
              </li>
              <li>
                Led 4 engineers to deliver production-grade applications using MVC, Agile, CI/CD, and microservices
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
                Raised final grades by an average of 35% for 90% of initially failing students by tutoring 12+ students in data
                structures, algorithms, mathematics, and debugging across Java, Python, C#, Swift, and SQL
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
                Built a VR action game in Unity using C# and Oculus SDK for psychological research, designing interactive
                object-dismemberment mechanics to stimulate prefrontal cortex engagement and reduce stress and anxiety by 30%
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
