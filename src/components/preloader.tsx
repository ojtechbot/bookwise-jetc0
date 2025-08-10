
'use client';

import { BookMarked } from 'lucide-react';

export function Preloader() {
  return (
    <div className="fixed inset-0 bg-background z-50 flex items-center justify-center">
      <div className="relative flex flex-col items-center">
        <div className="book">
            <div className="book__pg-shadow"></div>
            <div className="book__pg"></div>
            <div className="book__pg book__pg--2"></div>
            <div className="book__pg book__pg--3"></div>
            <div className="book__pg book__pg--4"></div>
            <div className="book__pg book__pg--5"></div>
        </div>
        <p className="mt-8 text-lg text-primary font-headline animate-pulse">Libroweb</p>
      </div>
    </div>
  );
}
