import AuthBrandingPanel from "@/components/auth/AuthBrandingPanel";

const RIGHT_PARTICLES = [
  { top: "15%", left: "88%", size: 2.5, delay: 0, duration: 8 },
  { top: "42%", left: "92%", size: 2, delay: 1, duration: 7.5 },
  { top: "70%", left: "6%", size: 2.5, delay: 2, duration: 9 },
  { top: "28%", left: "4%", size: 2, delay: 1.5, duration: 10 },
  { top: "82%", left: "85%", size: 2, delay: 0.5, duration: 8.5 },
  { top: "58%", left: "9%", size: 2.5, delay: 3, duration: 7 },
  { top: "90%", left: "45%", size: 2, delay: 2.5, duration: 9.5 },
  { top: "8%", left: "50%", size: 2, delay: 4, duration: 8 },
];

const RIGHT_NEURAL = {
  nodes: [
    { cx: "88%", cy: "12%", r: 2.5, delay: 0 },
    { cx: "94%", cy: "28%", r: 2, delay: 0.6 },
    { cx: "90%", cy: "42%", r: 2, delay: 1.2 },
    { cx: "6%", cy: "68%", r: 2.5, delay: 0.8 },
    { cx: "12%", cy: "82%", r: 2, delay: 1.4 },
    { cx: "8%", cy: "93%", r: 2, delay: 0.3 },
    { cx: "93%", cy: "72%", r: 2, delay: 1.8 },
    { cx: "50%", cy: "6%", r: 1.5, delay: 0.4 },
    { cx: "45%", cy: "94%", r: 1.5, delay: 1.6 },
  ],
  links: [[0, 1], [1, 2], [3, 4], [4, 5], [2, 6], [7, 0], [4, 8]],
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">
      <AuthBrandingPanel />

      {/* Form panel */}
      <div className="w-full lg:w-[48%] relative flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-indigo-50/40 p-6 sm:p-8 overflow-hidden">
        {/* Dot pattern background */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #6366f1 1px, transparent 0)`,
            backgroundSize: "28px 28px",
          }}
        />

        {/* AI Bubble 1: Top-right - large indigo/purple */}
        <div
          className="absolute -top-12 -right-12 w-44 h-44 rounded-full bg-gradient-to-br from-indigo-400/20 to-purple-400/10 blur-sm"
          style={{ animation: "glow-breathe 6s ease-in-out infinite" }}
        />

        {/* AI Bubble 2: Bottom-left - cyan/indigo */}
        <div
          className="absolute -bottom-10 -left-10 w-36 h-36 rounded-full bg-gradient-to-br from-cyan-400/15 to-indigo-400/10 blur-sm"
          style={{ animation: "glow-breathe 7s ease-in-out infinite 2s" }}
        />

        {/* AI Bubble 3: Mid-right - purple */}
        <div
          className="absolute top-[38%] -right-8 w-28 h-28 rounded-full bg-gradient-to-br from-purple-400/12 to-indigo-300/8"
          style={{ animation: "glow-breathe 8s ease-in-out infinite 3s" }}
        />

        {/* AI Bubble 4: Top-left area - subtle indigo */}
        <div
          className="absolute top-[18%] -left-6 w-24 h-24 rounded-full bg-gradient-to-br from-indigo-300/10 to-purple-300/5"
          style={{ animation: "glow-breathe 9s ease-in-out infinite 1s" }}
        />

        {/* AI Bubble 5: Bottom-right - faint */}
        <div
          className="absolute bottom-[15%] right-[10%] w-20 h-20 rounded-full bg-gradient-to-br from-indigo-300/8 to-purple-400/5"
          style={{ animation: "glow-breathe 10s ease-in-out infinite 4s" }}
        />

        {/* Orbit ring 1 */}
        <div
          className="absolute top-[20%] right-[8%] w-32 h-32 rounded-full border border-indigo-300/15"
          style={{ animation: "spin-slow 25s linear infinite" }}
        />

        {/* Orbit ring 2 - reversed */}
        <div
          className="absolute bottom-[18%] left-[6%] w-24 h-24 rounded-full border border-purple-300/12"
          style={{ animation: "spin-slow 18s linear infinite reverse" }}
        />

        {/* Orbit ring 3 - tilted via wrapper */}
        <div
          className="absolute top-[55%] right-[5%]"
          style={{ animation: "spin-slow 30s linear infinite" }}
        >
          <div className="w-20 h-20 rounded-full border border-indigo-200/10 rotate-45" />
        </div>

        {/* Pulse ring 1 */}
        <div
          className="absolute top-[28%] right-[14%] w-4 h-4 rounded-full border-2 border-indigo-400/25"
          style={{ animation: "pulse-ring-expand 3s ease-out infinite" }}
        />

        {/* Pulse ring 2 */}
        <div
          className="absolute bottom-[28%] left-[10%] w-3 h-3 rounded-full border-2 border-purple-400/20"
          style={{ animation: "pulse-ring-expand 4s ease-out infinite 1.5s" }}
        />

        {/* Pulse ring 3 */}
        <div
          className="absolute top-[60%] right-[20%] w-3 h-3 rounded-full border border-indigo-400/15"
          style={{ animation: "pulse-ring-expand 3.5s ease-out infinite 0.8s" }}
        />

        {/* Mini neural network SVG */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="rightNeuralGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#a78bfa" stopOpacity="0.25" />
            </linearGradient>
          </defs>
          {RIGHT_NEURAL.links.map(([from, to], i) => (
            <line
              key={`rl-${i}`}
              x1={RIGHT_NEURAL.nodes[from].cx}
              y1={RIGHT_NEURAL.nodes[from].cy}
              x2={RIGHT_NEURAL.nodes[to].cx}
              y2={RIGHT_NEURAL.nodes[to].cy}
              stroke="url(#rightNeuralGrad)"
              strokeWidth="0.5"
              style={{ animation: `neural-pulse 4s ease-in-out infinite ${i * 0.4}s` }}
            />
          ))}
          {RIGHT_NEURAL.nodes.map((n, i) => (
            <circle
              key={`rn-${i}`}
              cx={n.cx}
              cy={n.cy}
              r={n.r}
              fill="#818cf8"
              style={{ animation: `neural-pulse 4s ease-in-out infinite ${n.delay}s` }}
            />
          ))}
        </svg>

        {/* Floating data particles */}
        {RIGHT_PARTICLES.map((p, i) => (
          <div
            key={`rp-${i}`}
            className="absolute rounded-full bg-indigo-400"
            style={{
              top: p.top,
              left: p.left,
              width: p.size,
              height: p.size,
              animation: `particle-drift ${p.duration}s ease-in-out infinite ${p.delay}s`,
            }}
          />
        ))}

        {/* Floating geometric shapes */}
        <div
          className="absolute top-14 right-14 w-14 h-14 border border-indigo-200/30 rounded-lg rotate-45"
          style={{ animation: "particle-drift 14s ease-in-out infinite" }}
        />
        <div
          className="absolute bottom-24 left-10 w-10 h-10 border border-purple-200/30 rounded-full"
          style={{ animation: "particle-drift 11s ease-in-out infinite 2s" }}
        />
        <div
          className="absolute top-[35%] right-6 w-6 h-6 border border-indigo-200/20 rotate-12"
          style={{ animation: "particle-drift 16s ease-in-out infinite 4s" }}
        />

        {/* Top accent line */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-indigo-500/20 via-purple-500/10 to-transparent" />

        {/* Bottom accent line */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/10 to-purple-500/15" />

        <div className="w-full max-w-[420px] relative z-10 page-enter">
          {children}
        </div>
      </div>
    </div>
  );
}
