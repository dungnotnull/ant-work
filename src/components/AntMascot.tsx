"use client";

import { cn } from "@/lib/utils";

interface AntMascotProps {
  size?: number;
  className?: string;
  animated?: boolean;
}

export default function AntMascot({ size = 120, className, animated = false }: AntMascotProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(animated && "ant-mascot-animated", className)}
    >
      {/* Left antenna */}
      <path
        d="M75 58 Q65 30 50 20"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        className="ant-antenna-left"
      />
      <circle cx="50" cy="20" r="4" className="fill-indigo-500" />

      {/* Right antenna */}
      <path
        d="M125 58 Q135 30 150 20"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        className="ant-antenna-right"
      />
      <circle cx="150" cy="20" r="4" className="fill-indigo-500" />

      {/* Head */}
      <ellipse cx="100" cy="70" rx="28" ry="24" className="fill-slate-800" />
      <ellipse cx="100" cy="72" rx="24" ry="18" className="fill-slate-700" opacity="0.5" />

      {/* Eyes */}
      <ellipse cx="88" cy="66" rx="7" ry="8" className="fill-white" />
      <ellipse cx="112" cy="66" rx="7" ry="8" className="fill-white" />
      <ellipse cx="90" cy="65" rx="4" ry="4.5" className="fill-slate-900" />
      <ellipse cx="114" cy="65" rx="4" ry="4.5" className="fill-slate-900" />
      {/* Eye shine */}
      <ellipse cx="92" cy="63" rx="1.5" ry="1.5" className="fill-white" />
      <ellipse cx="116" cy="63" rx="1.5" ry="1.5" className="fill-white" />

      {/* Mandibles */}
      <path d="M82 82 Q88 90 95 85" className="stroke-slate-600" strokeWidth="2" strokeLinecap="round" fill="none" />
      <path d="M118 82 Q112 90 105 85" className="stroke-slate-600" strokeWidth="2" strokeLinecap="round" fill="none" />

      {/* Smile */}
      <path d="M90 78 Q100 86 110 78" className="stroke-slate-400" strokeWidth="2" strokeLinecap="round" fill="none" />

      {/* Thorax */}
      <ellipse cx="100" cy="112" rx="22" ry="20" className="fill-slate-800" />
      <ellipse cx="100" cy="114" rx="18" ry="14" className="fill-indigo-600" opacity="0.3" />

      {/* Thorax stripes */}
      <path d="M84 108 Q100 114 116 108" className="stroke-indigo-400" strokeWidth="1.5" opacity="0.4" fill="none" />
      <path d="M82 116 Q100 122 118 116" className="stroke-indigo-400" strokeWidth="1.5" opacity="0.4" fill="none" />

      {/* Petiole (waist) */}
      <ellipse cx="100" cy="136" rx="6" ry="5" className="fill-slate-700" />

      {/* Gaster (abdomen) */}
      <ellipse cx="100" cy="160" rx="28" ry="24" className="fill-slate-800" />
      <ellipse cx="100" cy="162" rx="24" ry="18" className="fill-indigo-600" opacity="0.15" />

      {/* Abdomen stripes */}
      <path d="M78 152 Q100 158 122 152" className="stroke-indigo-400" strokeWidth="1.5" opacity="0.3" fill="none" />
      <path d="M76 160 Q100 166 124 160" className="stroke-indigo-400" strokeWidth="1.5" opacity="0.3" fill="none" />
      <path d="M78 168 Q100 174 122 168" className="stroke-indigo-400" strokeWidth="1.5" opacity="0.3" fill="none" />

      {/* Left front leg */}
      <path d="M82 105 Q65 90 58 75" className="stroke-slate-700" strokeWidth="3" strokeLinecap="round" fill="none" />
      <path d="M58 75 L52 70" className="stroke-slate-700" strokeWidth="3" strokeLinecap="round" fill="none" />

      {/* Right front leg */}
      <path d="M118 105 Q135 90 142 75" className="stroke-slate-700" strokeWidth="3" strokeLinecap="round" fill="none" />
      <path d="M142 75 L148 70" className="stroke-slate-700" strokeWidth="3" strokeLinecap="round" fill="none" />

      {/* Left middle leg */}
      <path d="M80 112 Q60 112 48 105" className="stroke-slate-700" strokeWidth="3" strokeLinecap="round" fill="none" />
      <path d="M48 105 L42 102" className="stroke-slate-700" strokeWidth="3" strokeLinecap="round" fill="none" />

      {/* Right middle leg */}
      <path d="M120 112 Q140 112 152 105" className="stroke-slate-700" strokeWidth="3" strokeLinecap="round" fill="none" />
      <path d="M152 105 L158 102" className="stroke-slate-700" strokeWidth="3" strokeLinecap="round" fill="none" />

      {/* Left back leg */}
      <path d="M85 165 Q65 175 55 185" className="stroke-slate-700" strokeWidth="3" strokeLinecap="round" fill="none" />
      <path d="M55 185 L48 190" className="stroke-slate-700" strokeWidth="3" strokeLinecap="round" fill="none" />

      {/* Right back leg */}
      <path d="M115 165 Q135 175 145 185" className="stroke-slate-700" strokeWidth="3" strokeLinecap="round" fill="none" />
      <path d="M145 185 L152 190" className="stroke-slate-700" strokeWidth="3" strokeLinecap="round" fill="none" />
    </svg>
  );
}
