interface PDFViewerProps {
  url: string;
}

export default function PDFViewer({ url }: PDFViewerProps) {
  return (
    <div className="w-full h-[75vh] rounded-xl overflow-hidden border border-border">
      <iframe
        src={url}
        className="w-full h-full"
        title="Visor de PDF"
      />
    </div>
  );
}
