import AntMascot from "@/components/AntMascot";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">
      {/* Branding Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-900 relative overflow-hidden flex-col items-center justify-center p-12">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
            backgroundSize: "40px 40px",
          }} />
        </div>

        {/* Gradient orbs */}
        <div className="absolute top-20 left-20 w-72 h-72 bg-indigo-600/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />

        {/* Content */}
        <div className="relative z-10 text-center">
          <div className="mb-8 flex justify-center">
            <AntMascot size={180} animated />
          </div>
          <h1 className="text-4xl font-bold text-white mb-3 tracking-tight">DYM AntWork</h1>
          <p className="text-slate-400 text-lg max-w-sm mx-auto">
            Streamlined task management built for teams that move fast
          </p>

          {/* Feature highlights */}
          <div className="mt-10 grid grid-cols-2 gap-4 text-left max-w-sm mx-auto">
            <div className="bg-white/5 rounded-lg p-3 border border-white/10">
              <div className="text-indigo-400 text-sm font-semibold mb-1">Kanban Boards</div>
              <div className="text-slate-500 text-xs">Drag & drop task management</div>
            </div>
            <div className="bg-white/5 rounded-lg p-3 border border-white/10">
              <div className="text-emerald-400 text-sm font-semibold mb-1">Daily Reports</div>
              <div className="text-slate-500 text-xs">One-click standup templates</div>
            </div>
            <div className="bg-white/5 rounded-lg p-3 border border-white/10">
              <div className="text-amber-400 text-sm font-semibold mb-1">Performance</div>
              <div className="text-slate-500 text-xs">Velocity & completion metrics</div>
            </div>
            <div className="bg-white/5 rounded-lg p-3 border border-white/10">
              <div className="text-purple-400 text-sm font-semibold mb-1">Team Insights</div>
              <div className="text-slate-500 text-xs">Activity heatmap & trends</div>
            </div>
          </div>
        </div>
      </div>

      {/* Form Panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-[var(--background)] p-8">
        <div className="w-full max-w-md page-enter">
          {children}
        </div>
      </div>
    </div>
  );
}
