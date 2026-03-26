interface VideoPlayerProps {
  url: string;
}

function extractYouTubeId(url: string): string | null {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  return match ? match[1] : null;
}

function extractVimeoId(url: string): string | null {
  const match = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  return match ? match[1] : null;
}

export default function VideoPlayer({ url }: VideoPlayerProps) {
  const youtubeId = extractYouTubeId(url);
  const vimeoId = !youtubeId ? extractVimeoId(url) : null;

  if (youtubeId) {
    return (
      <div className="w-full aspect-video rounded-xl overflow-hidden bg-black">
        <iframe
          src={`https://www.youtube.com/embed/${youtubeId}?rel=0`}
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title="Video de YouTube"
        />
      </div>
    );
  }

  if (vimeoId) {
    return (
      <div className="w-full aspect-video rounded-xl overflow-hidden bg-black">
        <iframe
          src={`https://player.vimeo.com/video/${vimeoId}?color=ffffff&title=0&byline=0`}
          className="w-full h-full"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          title="Video de Vimeo"
        />
      </div>
    );
  }

  // Fallback: URL directa (mp4, etc.)
  return (
    <div className="w-full aspect-video rounded-xl overflow-hidden bg-black">
      <video src={url} controls className="w-full h-full" />
    </div>
  );
}
