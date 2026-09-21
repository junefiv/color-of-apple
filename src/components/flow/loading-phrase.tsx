export type LoadingPhraseSegment =
  | { type: "text"; value: string }
  | { type: "hex" }
  | { type: "count" };

export function parseLoadingPhraseTemplate(template: string): LoadingPhraseSegment[] {
  const segments: LoadingPhraseSegment[] = [];
  const pattern = /\{hex\}|\{count\}/g;
  let lastIndex = 0;

  for (const match of template.matchAll(pattern)) {
    const index = match.index ?? 0;
    if (index > lastIndex) {
      segments.push({ type: "text", value: template.slice(lastIndex, index) });
    }
    segments.push(match[0] === "{hex}" ? { type: "hex" } : { type: "count" });
    lastIndex = index + match[0].length;
  }

  if (lastIndex < template.length) {
    segments.push({ type: "text", value: template.slice(lastIndex) });
  }

  return segments;
}

export function LoadingPhrase({
  template,
  hex,
  count,
}: {
  template: string;
  hex: string;
  count: number;
}) {
  const segments = parseLoadingPhraseTemplate(template);

  return (
    <>
      {segments.map((segment, index) => {
        if (segment.type === "text") {
          return <span key={`text-${index}`}>{segment.value}</span>;
        }
        if (segment.type === "hex") {
          return (
            <span key={`hex-${index}`} className="match-load-hex" style={{ color: hex }}>
              {hex}
            </span>
          );
        }
        return (
          <span key={`count-${index}`} className="match-load-count">
            {count}
          </span>
        );
      })}
    </>
  );
}
