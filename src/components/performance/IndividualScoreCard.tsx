export default function IndividualScoreCard({ score }: { score: number }) {
  const color = score >= 80 ? "text-green-600" : score >= 60 ? "text-amber-600" : "text-red-600";

  return (
    <div className="bg-white border rounded-lg p-5">
      <h3 className="text-sm font-medium text-slate-500 mb-2">Individual Score</h3>
      <p className={`text-3xl font-semibold ${color}`}>{score}/100</p>
      <p className="text-sm text-slate-400 mt-1">50% completion + 30% on-time + 20% velocity</p>
    </div>
  );
}
