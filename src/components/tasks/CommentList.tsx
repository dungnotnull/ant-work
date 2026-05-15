"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { formatDistanceToNow } from "date-fns";

interface Comment {
  _id: string;
  content: string;
  user: { _id: string; name: string; email: string };
  createdAt: string;
}

export default function CommentList({ taskId }: { taskId: string }) {
  const queryClient = useQueryClient();
  const [newComment, setNewComment] = useState("");

  const { data: comments = [], isLoading } = useQuery({
    queryKey: ["comments", taskId],
    queryFn: async () => {
      const res = await fetch(`/api/tasks/${taskId}/comments`);
      const data = await res.json();
      return data.success ? (data.data as Comment[]) : [];
    },
  });

  const addMutation = useMutation({
    mutationFn: async (content: string) => {
      const res = await fetch(`/api/tasks/${taskId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      const data = await res.json();
      if (!data.success) throw new Error("Failed");
      return data.data;
    },
    onSuccess: () => {
      setNewComment("");
      queryClient.invalidateQueries({ queryKey: ["comments", taskId] });
    },
    onError: () => toast.error("Failed to add comment"),
  });

  return (
    <div>
      <h2 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
        <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
        Comments ({comments.length})
      </h2>

      {/* Comment input */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-sm mb-3">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
          className="w-full text-sm text-slate-900 placeholder:text-slate-300 border-0 focus:ring-0 resize-none p-0 bg-transparent outline-none"
          rows={2}
        />
        <div className="flex justify-end mt-2">
          <Button
            size="sm"
            onClick={() => addMutation.mutate(newComment)}
            disabled={!newComment.trim() || addMutation.isPending}
            className="bg-indigo-600 hover:bg-indigo-700 text-white h-8 text-xs"
          >
            {addMutation.isPending ? "Posting..." : "Comment"}
          </Button>
        </div>
      </div>

      {/* Comments list */}
      {isLoading ? (
        <div className="space-y-2">
          {[1, 2].map((i) => <div key={i} className="skeleton h-16 rounded-xl" />)}
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-6 bg-white border border-slate-200/80 rounded-xl">
          <p className="text-sm text-slate-400">No comments yet</p>
        </div>
      ) : (
        <div className="space-y-2 stagger-animate">
          {comments.map((comment) => (
            <div key={comment._id} className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-sm">
              <div className="flex items-center gap-2.5 mb-2">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-[8px] font-bold text-white">
                  {comment.user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                </div>
                <span className="text-sm font-medium text-slate-900">{comment.user.name}</span>
                <span className="text-xs text-slate-400">
                  {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                </span>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed pl-8">{comment.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
