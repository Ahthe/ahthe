"use client";

import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Container from "./shared/container";
import BatCat from "./ui/batcat";
import { MovingElement } from "./ui/moving-element";
import { AnimatedText } from "./ui/animated-text";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";

const NAV_ITEMS = {
  about: "/",
  work: "/work",
  projects: "/projects",
  blog: "/blog",
};

export const Header = () => {
  const pathname = usePathname();
  // Add state to prevent hydration mismatch
  const [isMounted, setIsMounted] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();

  // Only show client-side components after hydration
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  return (
    <header>
      <Container size="large">
        <nav
          className="flex flex-col fade items-center md:items-start justify-start py-8 tracking-tight w-full sm:pr-0 md:pr-6 lg:pr-0"
          aria-label="Main navigation"
        >
          <div className="flex flex-row items-center">
            <Link href="/">
              <div className="w-[40px] h-[40px]">
              <BatCat width={40} height={40} />
              </div>
              <span className="sr-only">Syed Ahthesham Ali</span>
            </Link>

            <div className="flex flex-col ml-4">
              <span className="text-medium inline-block font-medium">
                Syed Ahthesham Ali
              </span>
              <span className="opacity-60">Software Engineer</span>
            </div>
          </div>

          <div className="flex flex-row items-center justify-between sm:justify-end w-full mt-8 sm:mt-4 mb-0 sm:mb-4 tracking-tight">
            <div className="inline-flex items-center">
              {Object.entries(NAV_ITEMS).map(([name, href]) => (
                <AnimatedText 
                  key={name}
                  href={href}
                  // className="text-sm"
                  isActive={pathname === href}
                >
                  {name}
                </AnimatedText>
              ))}
            </div>
            {isMounted && (
              <MovingElement
                className="rounded-full p-[10px] mb-1"
                change={toggleTheme}
                ariaLabel={`Switch to ${
                  resolvedTheme === "dark" ? "light" : "dark"
                } mode`}
              >
                {resolvedTheme === "dark" ? <Moon size={20} /> : <Sun size={20} />}
              </MovingElement>
            )}
          </div>
        </nav>
      </Container>
    </header>
  );
};


// "use client";

// import { cn } from "@/lib/utils";
// import Image from "next/image";
// import Link from "next/link";
// import { usePathname } from "next/navigation";
// import Container from "./shared/container";
// import { ModeToggle } from "./ui/theme-toggle";

// const NAV_ITEMS = {
//   about: "/",
//   work: "/work",
//   projects: "/projects",
//   blog: "/blog",
// };

// export const Header = () => {
//   const pathname = usePathname();

//   return (
//     <header>
//       <Container size="large">
//         <nav
//           className="flex flex-col fade items-center md:items-start justify-start py-8 tracking-tight w-full sm:pr-0 md:pr-6 lg:pr-0"
//           aria-label="Main navigation"
//         >
//           <div className="flex flex-row items-center">
//             <Link href="/">
//               <Image
//                 src="/logo.svg"
//                 alt="Logo"
//                 width={40}
//                 height={40}
//                 priority={true}
//               />
//               <span className="sr-only">Syed Ahthesham Ali</span>
//             </Link>

//             <div className="flex flex-col ml-4">
//               <span className="text-medium inline-block font-medium">
//                 Syed Ahthesham Ali
//               </span>
//               <span className="opacity-60">Software Engineer</span>
//             </div>
//           </div>

//           <div className="flex flex-row items-center justify-between sm:justify-end w-full mt-8 sm:mt-4 mb-0 sm:mb-4 tracking-tight">
//             <div className="inline-flex items-center">
//               {Object.entries(NAV_ITEMS).map(([name, href]) => (
//                 <Link
//                   key={name}
//                   href={href}
//                   className={cn(
//                     pathname === href ? "font-semibold" : "font-normal",
//                     "transition-all hover:text-neutral-800 dark:hover:text-neutral-200 flex align-middle relative py-1 px-2"
//                   )}
//                 >
//                   {name}
//                 </Link>
//               ))}
//             </div>
//             <ModeToggle />
//           </div>
//         </nav>
//       </Container>
//     </header>
//   );
// };