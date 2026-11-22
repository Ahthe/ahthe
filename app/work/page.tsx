import Container from "@/components/shared/container";

export default function Work() {
  return (
    <Container size="large" className="mt-12 md:mt-24 mb-20">
      <main className="max-w-3xl mx-auto">
        <header className="mb-12 md:mb-20">
          <h1 className="text-4xl font-bold tracking-tight text-zinc-800 dark:text-zinc-100 mb-6">
            Work Experience
          </h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-xl">
            On a mission to create impactful applications that engage users and
            drive value for businesses. Here&apos;s a summary of my journey so
            far.
          </p>
        </header>

        <div className="relative border-l border-zinc-200 dark:border-zinc-800 ml-3 md:ml-4 space-y-12 md:space-y-20 pb-12">

          <article className="relative pl-8 md:pl-12">
            <div className="absolute -left-[5px] md:-left-[6px] top-2 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-4 ring-white dark:ring-zinc-950" />
            <header className="mb-6">
              <h2 className="text-xl md:text-2xl font-bold text-zinc-800 dark:text-zinc-100 tracking-tight">
                Captain Jay&apos;s Corporate
              </h2>
              <time className="block mt-2 text-sm font-medium text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">
                Software Engineer • Jan 2025 — Present
              </time>
            </header>
            <div className="prose prose-zinc dark:prose-invert max-w-none text-zinc-600 dark:text-zinc-400">
              <p>
                Architected the internal operations and AI platform for 27 restaurants and 462 employees (FastAPI, PostgreSQL, Next.js, Docker), partnering with leadership and external engineering teams to automate manual store workflows and ship production systems.
              </p>
              <ul>
                <li>
                  Cut new-hire training by 67% (3 weeks to 1) across 27 restaurants and 462 employees by building a 620-lesson LMS with server-enforced exams and 200+ pytest CI tests (Python, FastAPI REST API, PostgreSQL, Next.js, Docker).
                </li>
                <li>
                  Diagnosed and fixed a cache-and-sync bug in the prior LMS behind 1,151 false completions on shared store PCs, shipping a 4-layer sync fix, a dry-run repair script with DB backups (0 recurrences), and the incident report.
                </li>
                <li>
                  Built a food-safety photo checklist app (FastAPI, Next.js) where 3 AI models vote on each photo and unclear ones go to human review, raising completion from 15% to 95% with 0 wrong auto-grades in a 910-photo audit.
                </li>
                <li>
                  Replaced director-graded Cognito Forms audits with an AI agent pipeline (FastAPI, Next.js, Cloudflare R2) that EXIF-validates and grades photos, ranks 27 stores, and drafts coaching plans, saving the director 13+ hours weekly.
                </li>
                <li>
                  Restored 15 to 20% of menu items falsely marked out of stock by debugging NCR Aloha POS REST API integrations with 3 external engineering teams and fixing malformed JSON payloads and item-ID mismatches.
                </li>
                <li>
                  Raised live AI phone-order accuracy from 50% to 90% across 27 stores by designing the order state flow, prompt architecture, and strict-JSON POS schema, shipped through design reviews with the vendor&apos;s senior engineer.
                </li>
              </ul>
            </div>
          </article>

          <article className="relative pl-8 md:pl-12">
            <div className="absolute -left-[5px] md:-left-[6px] top-2 h-2.5 w-2.5 rounded-full bg-zinc-300 dark:bg-zinc-700 ring-4 ring-white dark:ring-zinc-950" />
            <header className="mb-6">
              <h2 className="text-xl md:text-2xl font-bold text-zinc-800 dark:text-zinc-100 tracking-tight">
                American Muslim Center Dearborn
              </h2>
              <time className="block mt-2 text-sm font-medium text-zinc-500 uppercase tracking-wide">
                Software Engineer • Mar 2024 — Jan 2025
              </time>
            </header>
            <div className="prose prose-zinc dark:prose-invert max-w-none text-zinc-600 dark:text-zinc-400">
              <p>
                Built full-stack community web applications with Next.js, TypeScript, and MongoDB to streamline event operations and member engagement.
              </p>
              <ul>
                <li>
                  Built a Stripe event registration platform and gamified quiz portal for 1,000+ members, automating ticket payments and attendee tracking (Next.js, TypeScript, MongoDB).
                </li>
              </ul>
            </div>
          </article>

          <article className="relative pl-8 md:pl-12">
            <div className="absolute -left-[5px] md:-left-[6px] top-2 h-2.5 w-2.5 rounded-full bg-zinc-300 dark:bg-zinc-700 ring-4 ring-white dark:ring-zinc-950" />
            <header className="mb-6">
              <h2 className="text-xl md:text-2xl font-bold text-zinc-800 dark:text-zinc-100 tracking-tight">
                Headstarter AI
              </h2>
              <time className="block mt-2 text-sm font-medium text-zinc-500 uppercase tracking-wide">
                Software Engineering Fellow • Jul 2024 — Oct 2024
              </time>
            </header>
            <div className="prose prose-zinc dark:prose-invert max-w-none text-zinc-600 dark:text-zinc-400">
              <p>
                Finished among 10 winners out of 3,000 teams, leading system architecture and code reviews to ship full-stack AI applications at scale.
              </p>
              <ul>
                <li>
                  Led a 4-engineer team that finished among 10 winners out of 3,000 teams and shipped 5 AI apps to 9,000+ users, designing system architecture and reviewing code (Go, Python, React, TypeScript, DynamoDB, AWS).
                </li>
                <li>
                  Built TradeWise, a real-time financial analysis app (Next.js, Llama 3.1 70B) used by 7,000+ of those users.
                </li>
              </ul>
            </div>
          </article>

          <article className="relative pl-8 md:pl-12">
            <div className="absolute -left-[5px] md:-left-[6px] top-2 h-2.5 w-2.5 rounded-full bg-zinc-300 dark:bg-zinc-700 ring-4 ring-white dark:ring-zinc-950" />
            <header className="mb-6">
              <h2 className="text-xl md:text-2xl font-bold text-zinc-800 dark:text-zinc-100 tracking-tight">
                University of Mount Union
              </h2>
              <time className="block mt-2 text-sm font-medium text-zinc-500 uppercase tracking-wide">
                Software Engineer & Math Tutor • Jan 2024 — Dec 2024
              </time>
            </header>
            <div className="prose prose-zinc dark:prose-invert max-w-none text-zinc-600 dark:text-zinc-400">
              <p>
                Tutored students in Systems Programming, Data Structures, Algorithms, and Mathematics.
              </p>
              <ul>
                <li>
                  Helped 90% of students improve grades significantly through targeted debugging and concept reinforcement.
                </li>
              </ul>
            </div>
          </article>

          <article className="relative pl-8 md:pl-12">
            <div className="absolute -left-[5px] md:-left-[6px] top-2 h-2.5 w-2.5 rounded-full bg-zinc-300 dark:bg-zinc-700 ring-4 ring-white dark:ring-zinc-950" />
            <header className="mb-6">
              <h2 className="text-xl md:text-2xl font-bold text-zinc-800 dark:text-zinc-100 tracking-tight">
                ACBSP VR Technologies
              </h2>
              <time className="block mt-2 text-sm font-medium text-zinc-500 uppercase tracking-wide">
                Research Software Engineer • Sep 2022 — Oct 2023
              </time>
            </header>
            <div className="prose prose-zinc dark:prose-invert max-w-none text-zinc-600 dark:text-zinc-400">
              <p>
                Engineered an interactive VR application in Unity and C# to support empirical psychology research on stress and anxiety reduction.
              </p>
              <ul>
                <li>
                  Built a VR stress-relief game (Unity, C#, Oculus) for a psychology study that found 30% lower stress and anxiety.
                </li>
              </ul>
            </div>
          </article>
        </div>
      </main>
    </Container>
  );
}
