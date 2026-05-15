"use client";

import { cn } from "@/lib/utils";

interface AntIconProps {
  size?: number;
  className?: string;
}

export default function AntIcon({ size = 32, className }: AntIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Antennas */}
      <path d="M22 18 Q18 8 14 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="14" cy="4" r="2.5" fill="#6366f1" />
      <path d="M42 18 Q46 8 50 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="50" cy="4" r="2.5" fill="#6366f1" />

      {/* Head */}
      <circle cx="32" cy="22" r="9" className="fill-current" />

      {/* Eyes */}
      <ellipse cx="28" cy="20" rx="2.5" ry="3" fill="white" />
      <ellipse cx="36" cy="20" rx="2.5" ry="3" fill="white" />
      <circle cx="29" cy="19.5" r="1.5" fill="#1e293b" />
      <circle cx="37" cy="19.5" r="1.5" fill="#1e293b" />
      <circle cx="29.8" cy="18.8" r="0.7" fill="white" />
      <circle cx="37.8" cy="18.8" r="0.7" fill="white" />

      {/* Thorax */}
      <ellipse cx="32" cy="36" rx="7" ry="7" className="fill-current" />

      {/* Petiole */}
      <circle cx="32" cy="45" r="2.5" className="fill-current opacity-80" />

      {/* Gaster */}
      <ellipse cx="32" cy="54" rx="10" ry="8" className="fill-current" />

      {/* Legs - simplified */}
      <path d="M26 34 Q18 28 14 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
      <path d="M38 34 Q46 28 50 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
      <path d="M25 38 Q16 38 12 34" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
      <path d="M39 38 Q48 38 52 34" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
      <path d="M27 52 Q20 56 16 60" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
      <path d="M37 52 Q44 56 48 60" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
    </svg>
  );
}
