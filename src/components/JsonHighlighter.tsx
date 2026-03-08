interface JsonHighlighterProps {
  content: string;
}

const JsonHighlighter = ({ content }: JsonHighlighterProps) => {
  let formatted: string;
  try {
    formatted = JSON.stringify(JSON.parse(content), null, 2);
  } catch {
    formatted = content;
  }

  // Simple syntax highlighting
  const highlighted = formatted.replace(
    /("(?:\\.|[^"\\])*")\s*:/g,
    '<span class="text-accent-foreground font-semibold">$1</span>:'
  ).replace(
    /:\s*("(?:\\.|[^"\\])*")/g,
    ': <span class="text-primary">$1</span>'
  ).replace(
    /:\s*(true|false|null)\b/g,
    ': <span class="text-destructive">$1</span>'
  ).replace(
    /:\s*(-?\d+\.?\d*)/g,
    ': <span class="text-primary">$1</span>'
  );

  return (
    <pre
      className="font-mono text-sm leading-6 text-foreground whitespace-pre-wrap break-words"
      dangerouslySetInnerHTML={{ __html: highlighted }}
    />
  );
};

export default JsonHighlighter;
