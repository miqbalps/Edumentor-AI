import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { useState } from "react";
import { LuCopy, LuCheck } from "react-icons/lu";

// Custom component to render block code with a copy button
function CodeBlock({ language, value }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <div className="my-6 rounded-lg overflow-hidden border border-gray-700 bg-gray-900 shadow-md text-left">
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-850 border-b border-gray-700 text-gray-400 text-xs font-semibold select-none font-sans">
        <span className="uppercase tracking-wider">{language || "code"}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer"
        >
          {copied ? (
            <>
              <LuCheck size={14} className="text-secondary" />
              <span className="text-secondary">Copied!</span>
            </>
          ) : (
            <>
              <LuCopy size={14} />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      {/* Code Area */}
      <pre className="p-4 overflow-x-auto font-mono text-sm leading-relaxed text-gray-100 bg-gray-900 m-0">
        <code>{value}</code>
      </pre>
    </div>
  );
}

function MarkdownRenderer({
  content
}){

  return(
    <div className="prose max-w-none">
      <ReactMarkdown
        remarkPlugins={[
          remarkMath
        ]}
        rehypePlugins={[
          rehypeKatex
        ]}
        components={{
          code({ node, inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || "");
            const isBlock = !inline && match;
            const codeVal = String(children).replace(/\n$/, "");

            if (isBlock) {
              return (
                <CodeBlock
                  language={match[1]}
                  value={codeVal}
                />
              );
            }

            if (!inline && codeVal.includes("\n")) {
              return (
                <CodeBlock
                  language="code"
                  value={codeVal}
                />
              );
            }

            return (
              <code
                className="bg-gray-100 text-red-600 px-1.5 py-0.5 rounded font-mono text-xs font-semibold"
                {...props}
              >
                {children}
              </code>
            );
          }
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

export default MarkdownRenderer;