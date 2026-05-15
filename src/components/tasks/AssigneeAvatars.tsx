interface Assignee {
  _id: string;
  name: string;
}

export default function AssigneeAvatars({ assignees }: { assignees: Assignee[] }) {
  return (
    <div className="flex -space-x-2">
      {assignees.slice(0, 3).map((a) => {
        const initials = a.name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
          .slice(0, 2);

        return (
          <div
            key={a._id}
            className="w-7 h-7 rounded-full bg-indigo-500 text-white flex items-center justify-center text-xs font-medium border-2 border-white"
            title={a.name}
          >
            {initials}
          </div>
        );
      })}
      {assignees.length > 3 && (
        <div className="w-7 h-7 rounded-full bg-slate-300 text-slate-600 flex items-center justify-center text-xs border-2 border-white">
          +{assignees.length - 3}
        </div>
      )}
    </div>
  );
}
