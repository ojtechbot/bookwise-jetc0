
'use client';

import { useState, useEffect } from 'react';
import { BookMarked } from 'lucide-react';

export function Preloader() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500); 

    return () => clearTimeout(timer);
  }, []);

  if (!loading) return null;

  return (
    <div className="fixed inset-0 bg-background z-50 flex items-center justify-center">
      <div className="flex flex-col items-center">
        <BookMarked className="w-16 h-16 text-primary animate-pulse" />
        <p className="mt-4 text-lg text-primary font-headline">Libroweb</p>
      </div>
    </div>
  );
}
