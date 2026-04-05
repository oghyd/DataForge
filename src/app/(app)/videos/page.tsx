import { getAllVideos } from "@/services/video-actions";
import { auth } from "@/lib/auth";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Video, Film } from "lucide-react";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { DeleteVideoButton } from "@/components/video/delete-video-button";

function formatFileSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

export default async function VideosPage({
  searchParams,
}: {
  searchParams: { page?: string; search?: string };
}) {
  const session = await auth();
  const isAdmin = session?.user?.role === "SUPER_ADMIN";

  const { videos, total, pages } = await getAllVideos({
    page: searchParams.page ? parseInt(searchParams.page) : 1,
    search: searchParams.search,
  });

  const currentPage = searchParams.page ? parseInt(searchParams.page) : 1;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Film className="h-8 w-8" /> Match Videos
        </h1>
        <p className="text-muted-foreground">
          {isAdmin
            ? `${total} video${total !== 1 ? "s" : ""} across all clubs`
            : `${total} video${total !== 1 ? "s" : ""} from your organization`}
        </p>
      </div>

      {videos.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Video className="mx-auto h-12 w-12 text-muted-foreground/30" />
            <h3 className="mt-4 text-lg font-semibold">No videos yet</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Upload match videos from any match detail page
            </p>
            <Link href="/matches">
              <Button className="mt-4" variant="outline">Go to Matches</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {videos.map((video) => {
            const homeLabel = video.match.homeTeam.club?.shortName || video.match.homeTeam.name;
            const awayLabel = video.match.awayTeam.club?.shortName || video.match.awayTeam.name;
            return (
              <Card key={video.id} className="overflow-hidden">
                <div className="relative bg-black">
                  <video
                    controls
                    preload="metadata"
                    className="w-full aspect-video"
                  >
                    <source src={video.filePath} type={video.mimeType} />
                  </video>
                </div>
                <CardContent className="p-4 space-y-2">
                  <p className="font-medium text-sm truncate">
                    {video.title || video.fileName}
                  </p>
                  <Link
                    href={`/matches/${video.matchId}`}
                    className="inline-flex items-center gap-2 text-xs text-primary hover:underline"
                  >
                    <Badge variant="secondary" className="text-[10px]">
                      {homeLabel} vs {awayLabel}
                    </Badge>
                    <span className="text-muted-foreground">
                      {formatDate(video.match.matchDate)}
                    </span>
                  </Link>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>
                      {formatFileSize(video.fileSize)} &middot; {video.uploadedBy.name}
                    </span>
                    <DeleteVideoButton videoId={video.id} />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {pages > 1 && (
        <div className="flex items-center justify-between pt-4">
          <p className="text-sm text-muted-foreground">
            Showing {(currentPage - 1) * 20 + 1}–{Math.min(currentPage * 20, total)} of {total}
          </p>
          <div className="flex gap-2">
            {currentPage > 1 && (
              <Link href={`/videos?page=${currentPage - 1}`}>
                <Button variant="outline" size="sm">Previous</Button>
              </Link>
            )}
            {currentPage < pages && (
              <Link href={`/videos?page=${currentPage + 1}`}>
                <Button variant="outline" size="sm">Next</Button>
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
