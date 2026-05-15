export default function CompletionRateCard({ rate, completed, total }: { rate: number; completed: number; total: number }) {
  return (
    <div className="bg-white border rounded-lg p-5">
      <h3 className="text-sm font-medium text-slate-500 mb-2">Completion Rate</h3>
      <p className="text-3xl font-semibold text-slate-900">{rate}%</p>
      <p className="text-sm text-slate-400 mt-1">{completed} / {total} tasks</p>
      <div className="w-full bg-slate-100 rounded-full h-2 mt-3">
        <div className="bg-green-500 h-2 rounded-full" style={{ width: `${rate}%` }} />
      </div>
    </div>
  );
}
