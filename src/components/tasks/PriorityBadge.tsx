import { Badge } from "@/components/ui/badge";
import { PRIORITY_COLORS, type Priority } from "@/lib/constants";

export default function PriorityBadge({ priority }: { priority: Priority }) {
  return (
    <Badge variant="secondary" className={PRIORITY_COLORS[priority]}>
      {priority}
    </Badge>
  );
}
