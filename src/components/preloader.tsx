
'use client';

import { Loader2 } from "lucide-react";

export function Preloader() {
  return (
    <div className="fixed inset-0 bg-background z-50 flex items-center justify-center">
      <div className="relative flex flex-col items-center gap-4">
        <Loader2 className="w-16 h-16 text-primary animate-spin" />
        <p className="text-lg text-primary font-headline">Foundation Polytechnic</p>
      </div>
    </div>
  );
}
