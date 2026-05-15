import { ImageResponse } from "next/og";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Background circle */}
        <circle cx="32" cy="32" r="30" fill="#6366f1" />

        {/* Antennas */}
        <path d="M22 22 Q18 12 14 8" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        <circle cx="14" cy="8" r="3" fill="#a5b4fc" />
        <path d="M42 22 Q46 12 50 8" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        <circle cx="50" cy="8" r="3" fill="#a5b4fc" />

        {/* Head */}
        <circle cx="32" cy="26" r="8" fill="white" />

        {/* Eyes */}
        <circle cx="29" cy="25" r="2" fill="#1e293b" />
        <circle cx="35" cy="25" r="2" fill="#1e293b" />
        <circle cx="29.7" cy="24.3" r="0.8" fill="white" />
        <circle cx="35.7" cy="24.3" r="0.8" fill="white" />

        {/* Thorax */}
        <ellipse cx="32" cy="39" rx="6" ry="6" fill="white" />

        {/* Petiole */}
        <circle cx="32" cy="47" r="2" fill="#e0e7ff" />

        {/* Gaster */}
        <ellipse cx="32" cy="55" rx="9" ry="6" fill="white" />

        {/* Legs */}
        <path d="M27 37 Q20 32 16 28" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none" />
        <path d="M37 37 Q44 32 48 28" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none" />
        <path d="M26 40 Q18 40 14 36" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none" />
        <path d="M38 40 Q46 40 50 36" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none" />
      </svg>
    ),
    { ...size }
  );
}
