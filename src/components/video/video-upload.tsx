"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, X, Video, Trash2, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { deleteVideo } from "@/services/video-actions";

interface MatchVideoData {
  id: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  title: string | null;
  description: string | null;
  createdAt: string;
  uploadedBy: { name: string; email: string };
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

export function VideoUploadSection({
  matchId,
  videos,
}: {
  matchId: string;
  videos: MatchVideoData[];
}) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState("");
  const [error, setError] = useState("");
  const [title, setTitle] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  async function handleUpload() {
    if (!selectedFile) return;
    setUploading(true);
    setError("");
    setProgress("Uploading...");

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("matchId", matchId);
    if (title) formData.append("title", title);

    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Upload failed");
      } else {
        setSelectedFile(null);
        setTitle("");
        if (fileRef.current) fileRef.current.value = "";
        router.refresh();
      }
    } catch {
      setError("Network error during upload");
    } finally {
      setUploading(false);
      setProgress("");
    }
  }

  async function handleDelete(videoId: string) {
    if (!confirm("Delete this video? This cannot be undone.")) return;
    const result = await deleteVideo(videoId);
    if (result.error) {
      setError(result.error);
    } else {
      router.refresh();
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Video className="h-4 w-4" /> Match Videos
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Upload form */}
        <div className="rounded-lg border border-dashed p-4 space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex-1 space-y-2">
              <Label htmlFor="video-title">Title (optional)</Label>
              <Input
                id="video-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Full match recording"
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <input
              ref={fileRef}
              type="file"
              accept="video/mp4,video/webm,video/quicktime"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) setSelectedFile(file);
              }}
            />
            <Button
              variant="outline"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
            >
              <Upload className="mr-2 h-4 w-4" />
              {selectedFile ? "Change file" : "Select video"}
            </Button>
            {selectedFile && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">
                  {selectedFile.name} ({formatFileSize(selectedFile.size)})
                </span>
                <button onClick={() => { setSelectedFile(null); if (fileRef.current) fileRef.current.value = ""; }}>
                  <X className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
                </button>
              </div>
            )}
          </div>
          {selectedFile && (
            <Button onClick={handleUpload} disabled={uploading}>
              {uploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> {progress}
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" /> Upload Video
                </>
              )}
            </Button>
          )}
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>

        {/* Video list */}
        {videos.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No videos uploaded for this match yet
          </p>
        ) : (
          <div className="space-y-3">
            {videos.map((video) => (
              <div key={video.id} className="rounded-lg border overflow-hidden">
                <video
                  controls
                  className="w-full max-h-[400px] bg-black"
                  preload="metadata"
                >
                  <source src={video.filePath} type="video/mp4" />
                  Your browser does not support video playback.
                </video>
                <div className="flex items-center justify-between p-3">
                  <div>
                    <p className="text-sm font-medium">{video.title || video.fileName}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(video.fileSize)} &middot; Uploaded by {video.uploadedBy.name} &middot;{" "}
                      {new Date(video.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(video.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
