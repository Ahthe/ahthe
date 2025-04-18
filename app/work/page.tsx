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
                American Muslim Center,  Dearborn
              </h2>
              <time className="text-neutral-600 dark:text-neutral-400 text-sm">
                Software Engineer, MAR 2024 — PRESENT
              </time>
            </header>
            <p>
              At the American Muslim Center, Dearborn, I work with a team of developers to build applications that 
              adress community challenges  using Next.js, JavaScript, MongoDB, and various APIs. My role focuses on coming up with creative 
              ideas and developing these applications alongside my team.
              {/* At American Muslim Center, Dearborn, I am part of the Partner Solution Development team,
              where I contribute to the development of B2B SaaS solutions
              tailored to our clients&apos; needs. My role involves
              collaborating with cross-functional teams to deliver scalable and
              efficient software solutions that help businesses grow and
              optimize their workflows. */}
            </p>
            <ul>
              <li>
              Expanded community reach from 800+ to potentially 1000+ members by developing an event booking website
              using NextJS, MongoDB, Clerk, and StripeAPI, streamlining registration and addressing social health concerns
              </li>
              <li>
              Created an interactive Quiz app with NextJS, Sanity.io, and MongoDB for summer school children and
              implemented engaging features such as leaderboards, increasing student engagement through gamified education
              </li>
              {/* <li>
                Implementing efficient and maintainable codebases using modern
                software development practices.
              </li>
              <li>
                Actively improving existing systems by identifying bottlenecks
                and implementing optimizations.
              </li> */}
            </ul>
          </article>

          <article>
            <header>
              <h2 className="font-medium text-xl mb-1 tracking-tighter">
                Headstarter AI
              </h2>
              <time className="text-neutral-600 dark:text-neutral-400 text-sm">
                Software Engineer Fellow, JULY 2024 — OCT 2024
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
              Built 5+ AI apps and APIs using Python, NextJS, OpenAI, Pinecone, StripeAPI with as seen by 8000+ users.
              </li>
              <li>Develop projects from design to deployment leading 4+ engineering fellows using MVC design patterns.</li>
              <li>
              Coached by Amazon, Bloomberg and Capital One engineers on Agile, CI/CD, Git, and microservice patterns.
              </li>
              {/* <li>
                Stayed abreast of emerging trends and best practices in
                front-end development, continually honing skills and exploring
                innovative solutions to technical challenges.
              </li>
              <li>
                Developed the{" "}
                <a href="https://app.utilify.xyz/ucl" rel="noopener noreferrer">
                  Campaign page
                </a>{" "}
                for the souvenir NFT distributed for the UCL final in
                partnership with Turkish Airlines.
              </li> */}
            </ul>
          </article>

          <article>
            <header>
              <h2 className="font-medium text-xl mb-1 tracking-tighter">
                University of Mount Union, Alliance, OH  </h2>
              <time className="text-neutral-600 dark:text-neutral-400 text-sm">
                Software Engineer and Math Tutor, JAN 2024 — DEC 2024
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
              Improved grades of 90% of tutored students from failing grades of 55% to high achievers 85-90% within a semester 
              by tutoring in Systems Programming, Data Structures, Algorithms, and Mathematics.
              </li>
              <li>Analyzed and debugged code in JavaScript, Python, C#, and SQL using IDE tools and debugging techniques,
                while teaching key math concepts such as calculus, linear algebra, and statistics resulting in a 35% grade increase.</li>
              {/* <li>
              Coached by Amazon, Bloomberg and Capital One engineers on Agile, CI/CD, Git, and microservice patterns.
              </li> */}
              {/* <li>
                Stayed abreast of emerging trends and best practices in
                front-end development, continually honing skills and exploring
                innovative solutions to technical challenges.
              </li>
              <li>
                Developed the{" "}
                <a href="https://app.utilify.xyz/ucl" rel="noopener noreferrer">
                  Campaign page
                </a>{" "}
                for the souvenir NFT distributed for the UCL final in
                partnership with Turkish Airlines.
              </li> */}
            </ul>
          </article>

          <article>
            <header>
              <h2 className="font-medium text-xl mb-1 tracking-tighter">
                ACBSP in VR Technologies - Startup & Research
              </h2>
              <time className="text-neutral-600 dark:text-neutral-400 text-sm">
                Software Engineer, SEP 2022 — APR 2023
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
              Tasked with creating a VR action game in Unity to study psychological behavior, improving research studies.
              </li>              
              <li>
              Constructed a VR action game in Unity using C# and Oculus SDK, targeting the prefrontal cortex to reduce
              user stress and anxiety by 30%, through strategic object dismemberment scenarios.
              </li>
              {/* <li>
                Stayed abreast of emerging trends and best practices in
                front-end development, continually honing skills and exploring
                innovative solutions to technical challenges.
              </li>
              <li>
                Developed the{" "}
                <a href="https://app.utilify.xyz/ucl" rel="noopener noreferrer">
                  Campaign page
                </a>{" "}
                for the souvenir NFT distributed for the UCL final in
                partnership with Turkish Airlines.
              </li> */}
            </ul>
          </article>

        </section>

         {/* Skills Section */}
         {/* <SkillsSection /> */}
         
      </main>
    </Container>
  );
}
