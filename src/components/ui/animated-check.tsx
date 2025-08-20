
'use client';

import { cn } from '@/lib/utils';
import './animated-check.css';

interface AnimatedCheckProps {
    className?: string;
}

export function AnimatedCheck({ className }: AnimatedCheckProps) {
    return (
        <svg
            className={cn("animated-check", className)}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 52 52"
        >
            <circle className="animated-check__circle" cx="26" cy="26" r="25" fill="none" />
            <path className="animated-check__check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
        </svg>
    );
}
