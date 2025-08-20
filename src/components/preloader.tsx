
'use client';

import { Loader2 } from "lucide-react";
import Image from "next/image";

export function Preloader() {
  return (
    <div className="fixed inset-0 bg-background z-50 flex items-center justify-center">
      <div className="relative flex flex-col items-center gap-4">
        <Image src="/images/logo.png" alt="Foundation Polytechnic Logo" width={240} height={60} className="h-12 w-auto mb-4" />
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    </div>
  );
}
