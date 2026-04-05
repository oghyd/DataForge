"use client";

import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteVideo } from "@/services/video-actions";
import { useRouter } from "next/navigation";

export function DeleteVideoButton({ videoId }: { videoId: string }) {
  const router = useRouter();

  async function handleDelete() {
    if (!confirm("Delete this video? This cannot be undone.")) return;
    await deleteVideo(videoId);
    router.refresh();
  }

  return (
    <Button variant="ghost" size="sm" onClick={handleDelete} className="h-6 px-2">
      <Trash2 className="h-3 w-3 text-destructive" />
    </Button>
  );
}
