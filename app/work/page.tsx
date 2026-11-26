import Container from "@/components/shared/container";
import Link from "next/link";

export default function Work() {
  return (
    <Container size="large" className="mt-12 md:mt-24 mb-20">
      <main className="max-w-3xl mx-auto">
        <header className="mb-12 md:mb-20">
          <h1 className="text-4xl font-bold tracking-tight text-zinc-800 dark:text-zinc-100 mb-6">
            Work Experience
          </h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-xl">
            Where I&apos;ve worked and the backend, applied AI, and full-stack
            systems I&apos;ve built.
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
                Software Engineer • Jan 2025 to Present
              </time>
            </header>
            <div className="prose prose-zinc dark:prose-invert max-w-none text-zinc-600 dark:text-zinc-400">
              <p>
                I find where software and AI can cut costs and manual work across 27 restaurants and 462 employees. I start in the stores, shadowing onboarding and meeting with district managers and the director of operations. Then I scope each project with operations leaders, write the system design, and ship the FastAPI and PostgreSQL backend and Next.js app.
              </p>
              <ul>
                <li>
                  Built a 620-lesson learning management system with server-enforced exams and 200+ pytest tests in CI (Python, FastAPI, PostgreSQL, Next.js, Docker). New-hire training dropped from 3 weeks to 1 across all 27 restaurants.
                </li>
                <li>
                  Fixed an inherited cache-and-sync bug in the old LMS that logged 1,151 false lesson completions on shared store PCs. Shipped a 4-layer sync fix, repaired the records with a dry-run script and database backups, and wrote the incident report, with no repeats since.
                </li>
                <li>
                  Built a food-safety checklist app where 3 AI models vote on each photo and unclear ones go to a person (FastAPI, Next.js). Completion rose from 15% to 95%, and a corporate audit of 910 photos found 0 wrong auto-grades.
                </li>
                <li>
                  Replaced hand-graded store audits in Cognito Forms with an AI agent pipeline (FastAPI, Next.js, Cloudflare R2). It checks photo metadata, grades photos against standards set with the CEO, ranks all 27 stores, and drafts coaching plans, saving the director 13+ hours a week.
                </li>
                <li>
                  When 15 to 20% of menu items wrongly showed as out of stock on the AI phone agent, traced the JSON order data with 3 external engineering teams, fixed the wrong item IDs and POS API errors, and got the full menu orderable (NCR Aloha).
                </li>
                <li>
                  Raised live AI phone order accuracy from 50% to 90% across 27 stores by redesigning the order state flow, prompt architecture, and strict JSON POS schema in design reviews with the vendor&apos;s senior engineer (
                  <Link href="/blog/ai-phone-ordering-50-to-90" className="underline">
                    how I did it
                  </Link>
                  ).
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
                Software Engineer • Mar 2024 to Jan 2025
              </time>
            </header>
            <div className="prose prose-zinc dark:prose-invert max-w-none text-zinc-600 dark:text-zinc-400">
              <p>
                I built the online tools the center uses for its events and member learning.
              </p>
              <ul>
                <li>
                  Built a Stripe event registration platform and a gamified quiz portal for 1,000+ members, automating ticket payments and attendee tracking (Next.js, TypeScript, MongoDB).
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
                Software Engineering Fellow • Jul 2024 to Oct 2024
              </time>
            </header>
            <div className="prose prose-zinc dark:prose-invert max-w-none text-zinc-600 dark:text-zinc-400">
              <p>
                An AI engineering fellowship where I led a remote team of 4 engineers. I chose what we built, designed the architecture, and reviewed the code.
              </p>
              <ul>
                <li>
                  Our team finished among 10 winners out of 3,000 teams and shipped 5 AI apps to 9,000+ users (Go, Python, React, TypeScript, DynamoDB, AWS).
                </li>
                <li>
                  Built TradeWise, a real-time financial analysis app that reached 7,000+ of those users (Next.js, Llama 3.1 70B).
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
                Computer Science & Math Tutor • Dec 2020 to Dec 2023
              </time>
            </header>
            <div className="prose prose-zinc dark:prose-invert max-w-none text-zinc-600 dark:text-zinc-400">
              <p>
                I tutored computer science and math students for three years while finishing my degree.
              </p>
              <ul>
                <li>
                  Tutored 12+ students in data structures, algorithms, discrete math, and calculus (Java, C++, Python, SQL). Of the students who came to me failing, 90% raised their final grades, by 35% on average.
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
                Research Software Engineer • Sep 2022 to Oct 2023
              </time>
            </header>
            <div className="prose prose-zinc dark:prose-invert max-w-none text-zinc-600 dark:text-zinc-400">
              <p>
                I worked on research software for a psychology study on stress and anxiety.
              </p>
              <ul>
                <li>
                  Built a VR stress-relief game in Unity and C# for Oculus headsets. The study found 30% lower stress and anxiety.
                </li>
              </ul>
            </div>
          </article>
        </div>
      </main>
    </Container>
  );
}
