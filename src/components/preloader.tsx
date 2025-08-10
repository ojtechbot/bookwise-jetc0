
'use client';

export function Preloader() {
  return (
    <div className="fixed inset-0 bg-background z-50 flex items-center justify-center">
      <div className="relative flex flex-col items-center">
        <div className="book-preloader">
          <div className="book-preloader__cover"></div>
          <div className="book-preloader__pages">
            <div className="book-preloader__page"></div>
            <div className="book-preloader__page"></div>
            <div className="book-preloader__page"></div>
          </div>
        </div>
        <p className="mt-8 text-lg text-primary font-headline animate-pulse">Libroweb</p>
      </div>
    </div>
  );
}
