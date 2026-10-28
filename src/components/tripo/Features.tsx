// src/components/tripo/Features.tsx

import { Sparkles, Zap, Award } from 'lucide-react';

export default function FeaturesSection() {
  const features = [
    {
      name: 'Instant Collaboration',
      description: 'Real‑time editing, chat, and live demos for any project.',
      icon: <Sparkles className="w-8 h-8 text-primary-600" />,
    },
    {
      name: 'AI‑Powered Workflows',
      description: 'Generate code, docs, and designs with a single click.',
      icon: <Zap className="w-8 h-8 text-primary-600" />,
    },
    {
      name: 'Showcase & Earn',
      description: 'Earn badges, get featured, and attract recruiters.',
      icon: <Award className="w-8 h-8 text-primary-600" />,
    },
  ];

  return (
    <section className="py-20 bg-white dark:bg-gray-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl md:text-4xl font-extrabold text-center text-gray-900 dark:text-gray-100 mb-12">
          What Makes Kollabrix Unique?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((f) => (
            <div
              key={f.name}
              className="flex flex-col items-center text-center p-6 bg-gray-50 dark:bg-gray-800 rounded-xl shadow hover:shadow-lg transition transform hover:-translate-y-1"
            >
              {f.icon}
              <h3 className="mt-4 text-xl font-semibold text-gray-800 dark:text-gray-200">
                {f.name}
              </h3>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                {f.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
