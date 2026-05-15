"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface VelocityData {
  month: string;
  storyPoints: number;
  tasks: number;
}

export default function VelocityChart({ data }: { data: VelocityData[] }) {
  return (
    <div className="bg-white border rounded-lg p-5">
      <h3 className="text-sm font-medium text-slate-500 mb-4">Velocity (Story Points per Month)</h3>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#94a3b8" />
          <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
          <Tooltip
            contentStyle={{ background: "#1e293b", border: "none", borderRadius: 8, color: "#f8fafc", fontSize: 13 }}
          />
          <Bar dataKey="storyPoints" fill="#6366f1" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
