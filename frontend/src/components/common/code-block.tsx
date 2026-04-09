import { cn } from "@/lib/utils";

interface CodeBlockProps {
  code: string;
  language?: string;
  className?: string;
}

export function CodeBlock({ code, language, className }: CodeBlockProps) {
  return (
    <div className={cn("rounded-lg bg-gray-900 overflow-hidden", className)}>
      {language && (
        <div className="px-4 py-1.5 text-xs text-gray-400 border-b border-gray-700">
          {language}
        </div>
      )}
      <pre className="p-4 overflow-x-auto">
        <code className="text-sm font-mono text-gray-100">{code}</code>
      </pre>
    </div>
  );
}
