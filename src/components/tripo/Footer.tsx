// src/components/tripo/Footer.tsx

import Link from 'next/link';
import { Github, Twitter, Linkedin } from 'lucide-react';

export default function FooterSection() {
  return (
    <footer className="bg-gray-900 text-gray-200 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center">
        <div className="mb-6 md:mb-0 text-center md:text-left">
          <h3 className="text-xl font-bold">Kollabrix</h3>
          <p className="text-sm mt-1">© {new Date().getFullYear()} Kollabrix. All rights reserved.</p>
        </div>
        <nav className="flex space-x-6">
          <Link href="/about" className="hover:underline">About</Link>
          <Link href="/privacy" className="hover:underline">Privacy</Link>
          <Link href="/terms" className="hover:underline">Terms</Link>
        </nav>
        <div className="flex space-x-4 mt-4 md:mt-0">
          <a href="https://github.com/kollabrix" target="_blank" rel="noopener noreferrer" className="hover:text-white">
            <Github className="w-5 h-5" />
          </a>
          <a href="https://twitter.com/kollabrix" target="_blank" rel="noopener noreferrer" className="hover:text-white">
            <Twitter className="w-5 h-5" />
          </a>
          <a href="https://linkedin.com/company/kollabrix" target="_blank" rel="noopener noreferrer" className="hover:text-white">
            <Linkedin className="w-5 h-5" />
          </a>
        </div>
      </div>
    </footer>
  );
}
