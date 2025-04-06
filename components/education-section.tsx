import React from "react";
// import { educationData, certificatesData, EducationItem, CertificateItem } from '@/data/education'; // Adjust path if needed
import {
  EducationItem,
  educationData,
  AchievementItem,
  achievementsData,
} from "@/data/education";
import { LuGraduationCap, LuAward } from "react-icons/lu"; // Import icons

const EducationSection: React.FC = () => {
  const formatDateRange = (startDate: string, endDate?: string): string => {
    const startYear = new Date(startDate).getFullYear();
    const endYear = endDate && !isNaN(new Date(endDate).getFullYear())
      ? new Date(endDate).getFullYear()
      : "Present";
    return `${startYear} - ${endYear}`;
  };

  const formatCertificateYear = (date: string): number => {
    return new Date(date).getFullYear();
  };

  return (
    <section className="mt-12">
      <h2 className="font-medium text-xl mb-2 tracking-tighter">Education</h2>
      
      {/* Education List */}
      <ul className="space-y-6">
        {educationData.map((edu) => (
          <li key={edu.institution} className="flex flex-col">
            <div className="flex justify-between items-center mb-1">
              <h3 className="font-medium text-base">
                <div className="flex items-start">
                  <LuGraduationCap className="mr-3 h-5 w-5 flex-shrink-0 text-neutral-500 dark:text-neutral-400 hidden md:inline-block" />
                  {edu.url ? (
                    <a
                      href={edu.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-blue-600 dark:hover:text-blue-400 hover:underline decoration-dotted underline-offset-4"
                    >
                      {edu.institution}
                    </a>
                  ) : (
                    <span>{edu.institution}</span>
                  )}
                </div>
              </h3>
              <time className="text-xs text-neutral-500 dark:text-neutral-500">
                {formatDateRange(edu.startDate, edu.endDate)}
              </time>
            </div>
            <div className="flex justify-between items-center ml-8 text-sm">
              <span className="text-neutral-600 dark:text-neutral-400">
                {edu.area}
              </span>
              {edu.location && (
                <span className="text-neutral-500 dark:text-neutral-500">
                  {edu.location}
                </span>
              )}
            </div>
          </li>
        ))}
      </ul>


      {/* Achievements Section - Refactored */}
      {/* Check if achievementsData exists and has items */}
      {achievementsData && achievementsData.length > 0 && (
        <div className="mt-8 pt-6 border-t border-neutral-200 dark:border-neutral-800">
          <h3 className="font-medium text-lg mb-4 tracking-tighter">
            Achievements
          </h3>
          <ul className="space-y-6">
            {/* Map over achievementsData */}
            {achievementsData.map((ach) => (
              // Use structure similar to education list item
              <li key={ach.name} className="flex flex-col">
                <div className="flex justify-between items-center"> {/* Removed mb-1 as there's no second line */}
                  {/* Achievement Name */}
                  <h4 className="font-medium text-base"> {/* Use h4 for semantic hierarchy */}
                    <div className="flex items-start">
                      <LuAward className="mr-3 h-5 w-5 flex-shrink-0 text-neutral-500 dark:text-neutral-400 hidden md:inline-block" />
                      {ach.url ? (
                        <a
                          href={ach.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-blue-600 dark:hover:text-blue-400 hover:underline decoration-dotted underline-offset-4"
                        >
                          {ach.name}
                        </a>
                      ) : (
                        <span>{ach.name}</span>
                      )}
                    </div>
                  </h4>
                  {/* Achievement Location (like date range) */}
                  {ach.location && (
                     <span className="text-xs text-neutral-500 dark:text-neutral-500 flex-shrink-0 ml-4"> {/* Added flex-shrink-0 and ml-4 for spacing */}
                       {ach.location}
                     </span>
                  )}
                </div>
                {/* No second line needed for achievements like area/location */}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
};

export default EducationSection;

// export default function EducationSection() {
//   return (
//     <div className="mt-10 ml-auto mr-auto w-9/10 md:w-9/10 max-w-3xl opacity:1 transform:none">
//       <div className="mt-10">
//         <h1 className="font-[500] text-gray-900 mb-4 text-xl text-opacity-100">
//           Education
//         </h1>
//         <div className="relative border-gray-200">
//           <div className="mb-4">
//             <div className="flex flex-row items-center justify-between">
//               <div className="text-md font-normal text-gray-900">
//                 Arizona State University
//               </div>
//               <div>
//                 <p className="text-gray-600">
//                   <span className="text-sm italic font-normal">2023</span>
//                   <span> - </span>
//                   <span className="italic text-sm font-normal">
//                     May 2025{" "}
//                     {/* <span className="hidden md:block italian">(Expected)</span> */}
//                   </span>
//                 </p>
//               </div>
//             </div>
//             <div className="flex flex-row items-center justify-between">
//               <div className=" text-sm font-normal text-gray-500">
//                 M.S.C.S in <span className="italic">Computer Science</span>
//               </div>
//               <p className="text-sm font-mono font-thin text-gray-700">
//                 CGPA : 4.1
//               </p>
//             </div>
//           </div>
//           <div className="mb-4">
//             <div className="flex flex-row items-center justify-between">
//               <div className="text-md font-normal text-gray-900">
//                 International Institute of Information Technology, Hyderabad
//                 (IIIT-H)
//               </div>
//               <div>
//                 <p className="text-gray-600">
//                   <span className="text-sm italic font-normal">2017</span>
//                   <span> - </span>
//                   <span className="italic text-sm font-normal">2018</span>
//                 </p>
//               </div>
//             </div>
//             <div className="text-sm font-normal text-gray-500">
//               M.S in <span className="italic">Computer Engineering</span>
//             </div>
//           </div>
//           <div className="mb-4">
//             <div className="flex flex-row items-center justify-between">
//               <div className="text-md font-normal text-gray-900">
//                 International Institute of Information Technology, Hyderabad
//                 (IIIT-H)
//               </div>
//               <div>
//                 <p className="text-gray-600">
//                   <span className="text-sm italic font-normal">2013</span>
//                   <span> - </span>
//                   <span className="italic text-sm font-normal">2017</span>
//                 </p>
//               </div>
//             </div>
//             <div className="text-sm font-normal text-gray-500">
//               Bachelors in <span className="italic">Computer Engineering</span>
//             </div>
//           </div>
//         </div>
//         <h4 className="font-[500] text-md mt-4 mb-1">Teaching:</h4>
//         <ul className="list-disc ml-8">
//           <li className="list-item text-gray-600">
//             Ta for <span className="italic">Advanced communication theory</span>
//             , Fall 2017
//           </li>
//           <li className="list-item text-gray-600">
//             Ta for <span className="italic">Information Theory and Coding</span>
//             , Fall 2016
//           </li>
//         </ul>
//         <h4 className="font-[500] text-md mt-4 mb-1">
//           Graduate-level Techincal Coursework:
//         </h4>
//         <ul className="list-disc ml-8">
//           <li className="list-item text-gray-600">
//             Distributed Database Systems (CSE 512)
//           </li>
//           <li className="list-item text-gray-600">
//             Distributed Software Development (CSE 445 / CSE 598)
//           </li>
//           <li className="list-item text-gray-600">Cloud Computing (CSE 575)</li>
//           <li className="list-item text-gray-600">Data Mining (CSE 572)</li>
//           <li className="list-item text-gray-600">
//             Statistical Machine Learning (CSE 575)
//           </li>
//         </ul>
//       </div>
//       <div className="mt-10">
//         <h1 className="font-[500] text-gray-900 mb-4 text-xl text-opacity-100">
//           Professional Experience
//         </h1>
//         <div className="flex flex-row items-center justify-between">
//           <div className="text-lg font-normal text-gray-900">
//             Project Leader, Oracle Cloud
//           </div>
//           <div>
//             <p className="text-gray-600">
//               <span className="text-sm italic font-normal">Feb 2023</span>
//               <span> - </span>
//               <span className="italic text-sm font-normal">Aug 2023</span>
//             </p>
//           </div>
//         </div>
//         <ul className="mt-2 list-disc ml-8">
//           <li className="list-item text-gray-600 text-md">
//             Led the rewrite of the PDF report generation pipeline in Go,
//             leveraging commodity compute for rapid scaling, Redis for job state
//             management, and S3 for ephemeral storage, cutting million-record
//             processing time from 6 hours to 30 minutes.
//           </li>
//           <li className="list-item text-gray-600">
//             Achieved seamless API migration with zero downtime by validating the
//             key performance metrics for the new APIs using a combination of
//             traffic replay, sticky canaries and A/B testing.
//           </li>
//           <li className="list-item text-gray-600">
//             Reduced storage costs by approximately 11% for applications in our
//             cost center by identifying cold, latency-tolerant paths, migrating
//             data to archival tiers, and improving lookup latency with Bloom
//             filters.
//           </li>
//         </ul>
//         <div className="mt-4 flex flex-row items-center justify-between">
//           <div className="text-lg font-normal text-gray-900">
//             Senior Application Developer, Oracle Cloud
//           </div>
//           <div>
//             <p className="text-gray-600">
//               <span className="text-sm italic font-normal">Dec 2020</span>
//               <span> - </span>
//               <span className="italic text-sm font-normal">Feb 2023</span>
//             </p>
//           </div>
//         </div>
//         <ul className="mt-2 list-disc ml-8">
//           <li className="list-item text-gray-600 text-md">
//             Designed, proposed and rolled out a revamped, containerized build
//             infrastructure for CI/CD using Docker, Kubernetes and Jenkins over 8
//             months, migrating over 300 jobs used by over 100 developers.
//           </li>
//           <li className="list-item text-gray-600">
//             Implemented circuit breakers using Resilience4j and fallback
//             mechanisms to enhance error context during service degradation. This
//             improved fault tolerance and reduced customer enhancement requests
//             by 18%.
//           </li>
//           <li className="list-item text-gray-600">
//             Built high-level, reusable eBPF tooling with simple Apis for network
//             diagnostics, tracing, and panic event decoding, enhancing
//             observability and simplifying debugging in Kubernetes-driven
//             microservices.
//           </li>
//         </ul>
//         <div className="mt-4 flex flex-row items-center justify-between">
//           <div className="text-lg font-normal text-gray-900">
//             Application Developer, Oracle Cloud
//           </div>
//           <div>
//             <p className="text-gray-600">
//               <span className="text-sm italic font-normal">June 2018</span>
//               <span> - </span>
//               <span className="italic text-sm font-normal">Dec 2020</span>
//             </p>
//           </div>
//         </div>
//         <ul className="mt-2 list-disc ml-8">
//           <li className="list-item text-gray-600 text-md">
//             Owned the end-to-end development of Cycle Count RESTful services
//             using SpringBoot, from writing code and reviewing external feature
//             requests to managing release documentation and approvals.
//           </li>
//           <li className="list-item text-gray-600">
//             Migrated legacy JSF UIs to React, reducing build size by 60% by
//             hosting static assets on a CDN and using Webpack bundle splitting to
//             optimize caching and load times.
//           </li>
//           <li className="list-item text-gray-600">
//             Identified and addressed gaps in automation and manual testing for
//             the inventory module, enhancing coverage with JUnit for middleware
//             and Selenium for automation, achieving 100% coverage for P1 flows
//             and 90% for P2 and P3 flows.
//           </li>
//         </ul>
//         <div className="mt-4 flex flex-row items-center justify-between">
//           <div className="text-lg font-normal text-gray-900">
//             Research Assistant,{" "}
//             <span>
//               <a
//                 className="underline font-medium"
//                 href="https://spcrc.iiit.ac.in/"
//                 target="_blank"
//               >
//                 Signal Processing and Communication Research Center
//               </a>
//             </span>
//           </div>
//           <div>
//             <p className="text-gray-600">
//               <span className="text-sm italic font-normal">Aug 2016</span>
//               <span> - </span>
//               <span className="italic text-sm font-normal">June 2018</span>
//             </p>
//           </div>
//         </div>
//         <div>
//           <p className="font-normal mt-2">Publications</p>
//         </div>
//         <ul className="mt-2 list-disc ml-8">
//           <li className="list-item text-gray-600 text-md">
//             <a
//               href="https://ieeexplore.ieee.org/abstract/document/8108296"
//               className="text-gray-600 hover:underline"
//               target="_blank"
//               rel="noopener noreferrer"
//             >
//               Relay selection and resource allocation for energy harvesting
//               cooperative networks
//             </a>
//           </li>
//           <li className="list-item text-gray-600 text-md">
//             <a
//               href="https://ieeexplore.ieee.org/abstract/document/8108278"
//               className="text-gray-600 hover:underline"
//               target="_blank"
//               rel="noopener noreferrer"
//             >
//               Optimal Resource Allocation and Relay Selection for
//               Self-Sustainable Relaying Networks
//             </a>
//           </li>
//         </ul>
//       </div>
//       {/* <div className="mt-16 p-6 w-full border border-gray-300 bg-white rounded-lg shadow-lg">
//         <div className="flex flex-row items-center justify-center space-x-6">
//           <img
//             className="w-20 h-20 rounded-full"
//             alt="Scanner Gif"
//             src={scannerGif}
//           />
//           <div className="flex flex-col">
//             <h2 className="text-gray-700 font-serif font-semibold text-lg mb-2">
//               Need a copy of my resume?
//             </h2>
//             <a
//               href={resume}
//               target="_blank"
//               className="underline text-gray-700 hover:text-gray-900 font-serif"
//             >
//               Click here to download it!
//             </a>
//           </div>
//         </div>
//       </div> */}
//     </div>
//   );
// }
