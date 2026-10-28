// src/components/tripo/Showcase.tsx

import Image from 'next/image';

const showcaseImages = [
  'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1542744095-fcf48d80b0fd?auto=format&fit=crop&w=800&q=80',
];

export default function ShowcaseSection() {
  return (
    <section className="py-24 bg-gray-100 dark:bg-gray-800">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 dark:text-gray-100 mb-12">
          Explore the Experience
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {showcaseImages.map((src, idx) => (
            <div key={idx} className="relative w-full h-64 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow">
              <Image src={src} alt={`Showcase ${idx + 1}`} fill className="object-cover" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
