import { Badge } from "@/components/ui/badge";
import { STATUS_COLORS, type TaskStatus } from "@/lib/constants";

export default function TaskStatusBadge({ status }: { status: TaskStatus }) {
  return (
    <Badge variant="secondary" className={STATUS_COLORS[status]}>
      {status}
    </Badge>
  );
}
