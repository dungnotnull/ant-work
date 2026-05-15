import AntIcon from "@/components/AntIcon";

export default function PageLoader({ fullScreen, message }: { fullScreen?: boolean; message?: string }) {
  return (
    <div className={fullScreen ? "min-h-screen flex items-center justify-center bg-slate-50" : "flex items-center justify-center py-20"}>
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-2 border-slate-200" />
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-indigo-500 animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <AntIcon size={16} className="text-indigo-400 animate-pulse" />
          </div>
        </div>
        <p className="text-sm text-slate-400">{message || "Loading"}</p>
      </div>
    </div>
  );
}
