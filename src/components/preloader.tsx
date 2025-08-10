
'use client';

import { useState, useEffect } from 'react';
import { BookMarked } from 'lucide-react';

export function Preloader() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000); 

    return () => clearTimeout(timer);
  }, []);

  if (!loading) return null;

  return (
    <div className="fixed inset-0 bg-background z-50 flex items-center justify-center">
      <div className="relative flex flex-col items-center">
        <div className="absolute -inset-4">
          <div className="w-24 h-24 rounded-full animate-spin-slow border-4 border-dashed border-primary border-t-transparent"></div>
        </div>
        <BookMarked className="w-16 h-16 text-primary" />
        <p className="mt-4 text-lg text-primary font-headline">Libroweb</p>
      </div>
    </div>
  );
}
