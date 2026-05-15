"use client";

import AntMascot from "@/components/AntMascot";

const PARTICLES = [
  { top: "12%", left: "18%", size: 3, delay: 0, duration: 7 },
  { top: "28%", left: "72%", size: 2, delay: 1, duration: 9 },
  { top: "58%", left: "14%", size: 4, delay: 2, duration: 6 },
  { top: "42%", left: "82%", size: 2, delay: 3, duration: 8 },
  { top: "74%", left: "38%", size: 3, delay: 1.5, duration: 10 },
  { top: "18%", left: "48%", size: 2, delay: 4, duration: 7.5 },
  { top: "84%", left: "62%", size: 3, delay: 0.5, duration: 9.5 },
  { top: "52%", left: "32%", size: 2, delay: 2.5, duration: 8.5 },
  { top: "8%", left: "88%", size: 3, delay: 3.5, duration: 6.5 },
  { top: "68%", left: "55%", size: 2, delay: 1, duration: 11 },
  { top: "35%", left: "8%", size: 2, delay: 4.5, duration: 8 },
  { top: "90%", left: "25%", size: 3, delay: 2, duration: 7 },
];

const NEURAL_NODES = [
  { cx: "18%", cy: "22%", delay: 0 },
  { cx: "38%", cy: "18%", delay: 0.5 },
  { cx: "62%", cy: "28%", delay: 1 },
  { cx: "82%", cy: "20%", delay: 1.5 },
  { cx: "22%", cy: "62%", delay: 0.8 },
  { cx: "48%", cy: "68%", delay: 1.3 },
  { cx: "72%", cy: "58%", delay: 0.3 },
  { cx: "12%", cy: "82%", delay: 1.8 },
  { cx: "38%", cy: "88%", delay: 2 },
  { cx: "62%", cy: "78%", delay: 0.6 },
  { cx: "88%", cy: "82%", delay: 1.1 },
  { cx: "55%", cy: "42%", delay: 0.4 },
];

const NEURAL_LINKS = [
  [0, 1], [1, 2], [2, 3], [4, 5], [5, 6], [7, 8], [8, 9], [9, 10],
  [0, 4], [1, 11], [11, 2], [5, 9], [3, 10], [6, 9], [4, 7],
];

const FEATURES = [
  {
    path: "M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7",
    title: "Kanban Boards",
    desc: "Drag & drop tasks",
    color: "text-indigo-400",
    borderHover: "hover:border-indigo-500/25",
  },
  {
    path: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
    title: "Daily Reports",
    desc: "Standup templates",
    color: "text-emerald-400",
    borderHover: "hover:border-emerald-500/25",
  },
  {
    path: "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6",
    title: "Performance",
    desc: "Velocity metrics",
    color: "text-amber-400",
    borderHover: "hover:border-amber-500/25",
  },
  {
    path: "M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
    title: "Team Insights",
    desc: "Activity heatmap",
    color: "text-purple-400",
    borderHover: "hover:border-purple-500/25",
  },
];

export default function AuthBrandingPanel() {
  return (
    <div className="hidden lg:flex lg:w-[52%] relative overflow-hidden flex-col items-center justify-center p-12 bg-[#06081a]">
      {/* Animated grid background */}
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(99, 102, 241, 0.6) 1px, transparent 1px),
            linear-gradient(90deg, rgba(99, 102, 241, 0.6) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
          animation: "grid-flow 8s linear infinite",
        }}
      />

      {/* Large gradient orbs */}
      <div
        className="absolute top-[15%] -left-24 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px]"
        style={{ animation: "glow-breathe 6s ease-in-out infinite" }}
      />
      <div
        className="absolute bottom-[10%] -right-16 w-[400px] h-[400px] bg-purple-600/15 rounded-full blur-[100px]"
        style={{ animation: "glow-breathe 8s ease-in-out infinite 2s" }}
      />
      <div
        className="absolute top-[45%] left-[40%] w-72 h-72 bg-cyan-500/8 rounded-full blur-[80px]"
        style={{ animation: "glow-breathe 10s ease-in-out infinite 4s" }}
      />

      {/* Scan line */}
      <div
        className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-400/40 to-transparent pointer-events-none"
        style={{ animation: "scan-line 4s linear infinite" }}
      />

      {/* Floating particles */}
      {PARTICLES.map((p, i) => (
        <div
          key={i}
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

      {/* Neural network SVG */}
      <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="neuralGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#a78bfa" stopOpacity="0.5" />
          </linearGradient>
        </defs>
        {NEURAL_LINKS.map(([from, to], i) => (
          <line
            key={`link-${i}`}
            x1={NEURAL_NODES[from].cx}
            y1={NEURAL_NODES[from].cy}
            x2={NEURAL_NODES[to].cx}
            y2={NEURAL_NODES[to].cy}
            stroke="url(#neuralGrad)"
            strokeWidth="0.5"
            style={{ animation: `neural-pulse 3s ease-in-out infinite ${i * 0.3}s` }}
          />
        ))}
        {NEURAL_NODES.map((n, i) => (
          <circle
            key={`node-${i}`}
            cx={n.cx}
            cy={n.cy}
            r="2.5"
            fill="#818cf8"
            style={{ animation: `neural-pulse 3s ease-in-out infinite ${n.delay}s` }}
          />
        ))}
      </svg>

      {/* Content */}
      <div className="relative z-10 text-center scale-[1.2]">
        {/* Mascot with glow */}
        <div className="mb-8 flex justify-center relative">
          <div
            className="absolute inset-0 bg-indigo-500/15 blur-[60px] rounded-full scale-[2]"
            style={{ animation: "glow-breathe 4s ease-in-out infinite" }}
          />
          <div className="relative drop-shadow-[0_0_30px_rgba(99,102,241,0.3)]">
            <AntMascot size={170} animated />
          </div>
        </div>

        <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">DYM AntWork</h1>
        <p className="text-slate-400 text-base max-w-xs mx-auto mb-3">
          Streamlined task management for teams that move fast
        </p>

        {/* AI badge */}
        <div
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-medium mb-10"
          style={{ animation: "border-glow 3s ease-in-out infinite" }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full bg-emerald-400"
            style={{ animation: "glow-breathe 2s ease-in-out infinite" }}
          />
          AI-Powered Task Management
        </div>

        {/* Feature highlights */}
        <div className="grid grid-cols-2 gap-3 text-left max-w-sm mx-auto">
          {FEATURES.map((f, i) => (
            <div
              key={i}
              className={`group bg-white/[0.03] rounded-xl p-3.5 border border-white/[0.06] backdrop-blur-sm ${f.borderHover} transition-all duration-300`}
              style={{ animation: `fade-in-up-delayed 0.6s ease-out both ${i * 120 + 300}ms` }}
            >
              <svg
                className={`w-4 h-4 ${f.color} mb-2 group-hover:scale-110 transition-transform duration-300`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d={f.path} />
              </svg>
              <div className={`${f.color} text-[13px] font-semibold mb-0.5`}>{f.title}</div>
              <div className="text-slate-500 text-xs">{f.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom accent line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/25 to-transparent" />
    </div>
  );
}
