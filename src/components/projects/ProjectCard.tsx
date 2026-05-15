import Link from "next/link";

interface ProjectCardProps {
  project: {
    _id: string;
    name: string;
    description: string;
    team: { _id: string; name: string };
    createdBy: { _id: string; name: string };
    totalTasks: number;
    doneTasks: number;
    updatedAt: string;
  };
}

export default function ProjectCard({ project }: ProjectCardProps) {
  const progress = project.totalTasks > 0 ? Math.round((project.doneTasks / project.totalTasks) * 100) : 0;

  return (
    <Link href={`/projects/${project._id}`}>
      <div className="group bg-white border border-slate-200/80 rounded-xl p-5 hover:shadow-lg hover:border-indigo-200 transition-all duration-300 cursor-pointer">
        <div className="flex items-start justify-between mb-3">
          <h3 className="font-semibold text-slate-900 truncate group-hover:text-indigo-600 transition-colors">
            {project.name}
          </h3>
          <span className="text-xs text-slate-400 bg-slate-50 px-2 py-0.5 rounded-md shrink-0 ml-2">
            {project.team.name}
          </span>
        </div>
        {project.description && (
          <p className="text-sm text-slate-500 line-clamp-2 mb-4">{project.description}</p>
        )}
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-slate-400">{project.doneTasks}/{project.totalTasks} tasks</span>
            <span className="font-medium text-slate-600">{progress}%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-1.5 rounded-full transition-all duration-500 ${
                progress === 100 ? "bg-emerald-500" : progress > 50 ? "bg-indigo-500" : "bg-slate-400"
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </Link>
  );
}
