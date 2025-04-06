import React from 'react';
// import { educationData, certificatesData, EducationItem, CertificateItem } from '@/data/education'; // Adjust path if needed
import { EducationItem, educationData, certificatesData as AwardsData } from '@/data/education';
import { LuGraduationCap, LuAward } from 'react-icons/lu'; // Import icons

const EducationSection: React.FC = () => {
  const formatDateRange = (startDate: string, endDate?: string): string => {
    const startYear = new Date(startDate).getFullYear();
    const endYear = endDate ? new Date(endDate).getFullYear() : 'Present'; // Use 'Present' like Astro
    return `${startYear} - ${endYear}`;
  };

  const formatCertificateYear = (date: string): number => {
    return new Date(date).getFullYear();
  };

  return (
    <section className="mt-12"> {/* Add margin-top */}
      <h2 className="font-medium text-xl mb-4 tracking-tighter">Education</h2>

      {/* Education List */}
      <ul className="space-y-6"> {/* Use space-y for vertical spacing */}
        {educationData.map((edu) => (
          <li key={edu.institution} className="flex items-start"> {/* Use items-start */}
            <LuGraduationCap className="mr-3 h-5 w-5 flex-shrink-0 text-neutral-500 dark:text-neutral-400 mt-1 hidden md:inline-block" />
            <div className="relative flex-grow">
              <h3 className="font-medium text-base mb-0.5"> {/* Adjusted text size */}
                {edu.url ? (
                  <a
                    href={edu.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-blue-600 dark:hover:text-blue-400 hover:underline decoration-dotted underline-offset-4" // Added underline style
                  >
                    {edu.institution}
                  </a>
                ) : (
                  <span>{edu.institution}</span>
                )}
              </h3>
              <div className="text-sm text-neutral-600 dark:text-neutral-400">{edu.area}</div>
              <time className="text-xs text-neutral-500 dark:text-neutral-500 md:absolute md:right-0 md:top-0.5">
                {formatDateRange(edu.startDate, edu.endDate)}
              </time>
            </div>
          </li>
        ))}
      </ul>

      {/* Certificates Section (Conditional) */}
      {AwardsData.length > 0 && (
        <div className="mt-8 pt-6 border-t border-neutral-200 dark:border-neutral-800"> {/* Add separator */}
          <h3 className="font-medium text-lg mb-4 tracking-tighter">Certificates</h3> {/* Sub-heading */}
          <ul className="space-y-6">
            {AwardsData.map((cert) => (
              <li key={cert.name} className="flex items-start">
                <LuAward className="mr-3 h-5 w-5 flex-shrink-0 text-neutral-500 dark:text-neutral-400 mt-1 hidden md:inline-block" />
                <div className="relative flex-grow">
                  <h4 className="font-medium text-base mb-0.5"> {/* Use h4 for semantics */}
                    {cert.url ? (
                      <a
                        href={cert.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-blue-600 dark:hover:text-blue-400 hover:underline decoration-dotted underline-offset-4"
                      >
                        {cert.name}
                      </a>
                    ) : (
                      <span>{cert.name}</span>
                    )}
                  </h4>
                  <div className="text-sm text-neutral-600 dark:text-neutral-400">{cert.issuer}</div>
                  <time className="text-xs text-neutral-500 dark:text-neutral-500 md:absolute md:right-0 md:top-0.5">
                    {formatCertificateYear(cert.date)}
                  </time>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
};

export default EducationSection;