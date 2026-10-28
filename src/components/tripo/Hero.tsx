'use client';

// src/components/tripo/Hero.tsx

import Image from 'next/image';
import Link from 'next/link';

export default function HeroSection() {
  return (
    <>
      <section className="relative h-screen overflow-hidden">
        {/* Background image */}
        <Image
          src="https://images.unsplash.com/photo-1522199670076-2852f80289c6?auto=format&fit=crop&w=1920&q=80"
          alt="Hero background"
          fill
          className="object-cover opacity-70"
          priority
        />
        {/* Animated gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-500 to-indigo-600 opacity-30 animate-bg-gradient" />
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4">
          <h1 className="text-5xl sm:text-7xl font-extrabold text-white tracking-tight animate-fade-in-down">
            Welcome to Kollabrix
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-gray-200 animate-fade-in-up delay-150">
            Build, collaborate and showcase your projects with the most vibrant community of creators.
          </p>
          <Link
            href="/explore"
            className="mt-8 inline-block px-8 py-3 bg-primary-600 text-white rounded-full font-medium hover:bg-primary-700 transition"
          >
            Explore Projects
          </Link>
        </div>
      </section>
      {/* Simple fade‑in animations using Tailwind utilities */}
      <style jsx global>{`\n        @keyframes fadeInDown {\n          from { opacity: 0; transform: translateY(-20px); }\n          to { opacity: 1; transform: translateY(0); }\n        }\n        @keyframes fadeInUp {\n          from { opacity: 0; transform: translateY(20px); }\n          to { opacity: 1; transform: translateY(0); }\n        }\n        @keyframes bgGradient {\n          0% { background-position: 0% 50%; }\n          50% { background-position: 100% 50%; }\n          100% { background-position: 0% 50%; }\n        }\n        .animate-fade-in-down { animation: fadeInDown 800ms ease-out forwards; }\n        .animate-fade-in-up { animation: fadeInUp 800ms ease-out forwards; }\n        .animate-bg-gradient {\n          background-size: 300% 300%;\n          animation: bgGradient 8s ease infinite;\n        }\n      `}</style>\n    </>
  );\n}\n

// src/components/tripo/Hero.tsx

import Image from 'next/image';
import Link from 'next/link';

export default function HeroSection() {
  return (
    <>
      <section className="relative h-screen bg-gray-900 overflow-hidden">
        {/* Background image – replace with your own hero image */}
        <Image
          src="https://images.unsplash.com/photo-1522199670076-2852f80289c6?auto=format&fit=crop&w=1920&q=80"
          alt="Hero background"
          fill
          className="object-cover opacity-70"
          priority
        />
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4">
          <h1 className="text-5xl sm:text-7xl font-extrabold text-white tracking-tight animate-fade-in-down">
            Welcome to Kollabrix
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-gray-200 animate-fade-in-up delay-150">
            Build, collaborate and showcase your projects with the most vibrant community of creators.
          </p>
          <Link
            href="/explore"
            className="mt-8 inline-block px-8 py-3 bg-primary-600 text-white rounded-full font-medium hover:bg-primary-700 transition"
          >
            Explore Projects
          </Link>
        </div>
      </section>
      {/* Simple fade‑in animations using Tailwind utilities */}
      <style jsx global>{`
        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-down { animation: fadeInDown 800ms ease-out forwards; }
        .animate-fade-in-up { animation: fadeInUp 800ms ease-out forwards; }
      `}</style>
    </>
  );
}
