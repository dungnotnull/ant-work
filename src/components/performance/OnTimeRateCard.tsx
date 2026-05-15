export default function OnTimeRateCard({ rate }: { rate: number }) {
  return (
    <div className="bg-white border rounded-lg p-5">
      <h3 className="text-sm font-medium text-slate-500 mb-2">On-Time Rate</h3>
      <p className="text-3xl font-semibold text-slate-900">{rate}%</p>
      <p className="text-sm text-slate-400 mt-1">Tasks completed by due date</p>
      <div className="w-full bg-slate-100 rounded-full h-2 mt-3">
        <div className="bg-indigo-500 h-2 rounded-full" style={{ width: `${rate}%` }} />
      </div>
    </div>
  );
}
