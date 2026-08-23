import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";

type P = { children?: React.ReactNode };
type CP = { className?: string; children?: React.ReactNode };
type AP = { href?: string; children?: React.ReactNode };

const components = {
  h1: ({ children }: P) => (
    <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight text-secondary mt-10 mb-4">{children}</h1>
  ),
  h2: ({ children }: P) => (
    <h2 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-secondary mt-8 mb-3">{children}</h2>
  ),
  h3: ({ children }: P) => (
    <h3 className="font-display text-xl font-semibold tracking-tight text-secondary mt-6 mb-2">{children}</h3>
  ),
  p: ({ children }: P) => <p className="text-secondary/90 leading-[1.8] mb-5">{children}</p>,
  a: ({ href, children }: AP) => (
    <a href={href} target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2 hover:no-underline">
      {children}
    </a>
  ),
  ul: ({ children }: P) => <ul className="list-disc pl-6 mb-5 space-y-2 text-secondary/90">{children}</ul>,
  ol: ({ children }: P) => <ol className="list-decimal pl-6 mb-5 space-y-2 text-secondary/90">{children}</ol>,
  li: ({ children }: P) => <li className="leading-[1.7]">{children}</li>,
  blockquote: ({ children }: P) => (
    <blockquote className="border-l-4 border-accent pl-4 italic text-muted-foreground my-6">{children}</blockquote>
  ),
  code: ({ className, children }: CP) =>
    className ? (
      <pre className="bg-muted border border-border rounded-lg p-4 my-5 overflow-x-auto">
        <code className="text-sm font-mono text-secondary">{children}</code>
      </pre>
    ) : (
      <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono text-primary">{children}</code>
    ),
  pre: ({ children }: P) => <>{children}</>,
  hr: () => <hr className="border-border my-8" />,
  img: (props: React.ImgHTMLAttributes<HTMLImageElement>) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img {...props} alt={props.alt || ""} className="rounded-xl border border-border my-6 w-full" loading="lazy" />
  ),
  table: ({ children }: P) => <table className="w-full border-collapse my-6 text-sm">{children}</table>,
  th: ({ children }: P) => (
    <th className="border border-border bg-muted/50 px-3 py-2 text-left font-semibold text-secondary">{children}</th>
  ),
  td: ({ children }: P) => <td className="border border-border px-3 py-2 text-secondary/90">{children}</td>,
  strong: ({ children }: P) => <strong className="font-bold text-secondary">{children}</strong>,
  em: ({ children }: P) => <em className="italic">{children}</em>,
};

export default function Markdown({ children }: { children: string }) {
  return (
    <ReactMarkdown components={components} rehypePlugins={[rehypeRaw]}>
      {children}
    </ReactMarkdown>
  );
}
