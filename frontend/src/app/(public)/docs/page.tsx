"use client"
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Zap, Terminal, Code, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { useState } from "react";
import { Copy, Check } from "lucide-react";

type CodeBlockProps = {
  code: string;
  language?: string;
};

function CodeBlock({ code, language = "javascript" }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group">
      {/* Copy Button */}
      <button
        onClick={handleCopy}
        className="absolute top-2 right-2 z-10 flex items-center gap-1 px-2 py-1 text-xs rounded-md bg-black/40 hover:bg-black/60 text-white transition cursor-pointer"
      >
        {copied ? <Check className="text-accent-emerald" size={14} /> : <Copy size={14} />}
      </button>

      {/* Code */}
      <SyntaxHighlighter
        language={language}
        style={oneDark}
        showLineNumbers
        customStyle={{
          borderRadius: "12px",
          padding: "16px",
          margin: 0,
          fontSize: "15px",
        }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}

export default function PublicDocsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-8 animate-fade-in">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-text-primary">API Documentation</h1>
        <p className="text-text-muted mt-2">Everything you need to start using oneAPI</p>
      </div>

      <Card>
        <div className="flex items-center gap-2 mb-4"><Zap size={16} className="text-brand-400" /><h2 className="text-base font-semibold text-text-primary">Quick Start</h2></div>
        <ol className="list-decimal list-inside space-y-2  text-text-secondary">
          <li><Link href="/signup" className="text-brand-400 hover:underline">Create an account</Link> and subscribe to a plan</li>
          <li>Generate an API key from your dashboard</li>
          <li>Make requests to <code className="bg-surface-elevated px-1.5 py-0.5 rounded text-accent-blue text-xs">POST http://localhost:8000/api/v1/chat/completions</code></li>
        </ol>
      </Card>

      {/* Curl Request  */}
      <Card>
        <div className="flex items-center gap-2 mb-4"><Terminal size={16} className="text-accent-emerald" /><h2 className="text-base font-semibold text-text-primary">cURL Example</h2><Badge variant="success">bash</Badge></div>
        <CodeBlock
          language="bash"
          code={`curl -X POST http://localhost:8000/api/v1/chat/completions \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -d '{"model":"gemini-1.5-flash","messages":[{"role":"user","content":"Hello!"}],"stream":true}'`}
        />
      </Card>

      {/* javascript Fetch Example */}
      <Card>
        <div className="flex items-center gap-2 mb-4"><Code size={16} className="text-accent-amber" /><h2 className="text-base font-semibold text-text-primary">JavaScript</h2><Badge variant="warning">fetch</Badge></div>
        <CodeBlock
          language="javascript"
          code={`const res = await fetch("http://localhost:8000/api/v1/chat/completions", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": "Bearer YOUR_API_KEY"
  },
  body: JSON.stringify({
    model: "gemini-1.5-flash",
    messages: [{ role: "user", content: "Hello!" }],
    stream: true
  })
});`}
        />
      </Card>

      {/* Response Format */}

      <Card>
        <div className="flex items-center gap-2 mb-4">
          <Code size={16} className="text-accent-blue" />
          <h2 className="text-base font-semibold text-text-primary">Response Format</h2>
          <Badge variant="warning">json</Badge>
        </div>
        <CodeBlock
          language="json"
          code={`{
  "message": "Response generated successfully",
  "success": true,
  "data": {
    "choices": [
      {
        "message": {
          "role": "assistant",
          "content": "Good morning! I am an artificial intelligence language model..."
        }
      }
    ],
    "usage": {
      "prompt_tokens": 53,
      "completion_tokens": 70,
      "total_tokens": 123,
      "totalCost": 0.01122
    },
    "model": "llama-3.1-8b-instant"
  }
}`}
        />
      </Card>



      {/* Extracting the Response */}
      <Card>
        <div className="flex items-center gap-2 mb-3">
          <Code size={16} className="text-accent-blue" />
          <h2 className="text-base font-semibold text-text-primary">
            Extracting the Response
          </h2>
        </div>

        <p className="text-text-secondary mb-4">
          After calling the API, you can extract the AI-generated message from the response object.
          The content is available inside <code className="bg-surface-elevated px-1 py-0.5 rounded text-xs">data.data.choices[0].message.content</code>.
        </p>

        <CodeBlock
          language="javascript"
          code={`const res = await fetch("http://localhost:8000/api/v1/chat/completions", {...});
const data = await res.json();

// ✅ Extract AI response
const message = data.data.choices[0].message.content;

console.log(message);`}
        />
      </Card>

      {/* Assistant Prefill" section */}
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <Terminal size={16} className="text-accent-emerald" />
          <h2 className="text-base font-semibold text-text-primary">Assistant Prefill</h2>
          <Badge>advanced</Badge>
        </div>

        <p className="text-text-secondary mb-4">
          oneAPI supports asking models to complete a partial response. This can be useful for guiding models to respond in a certain way.
        </p>
        <p className="text-text-secondary mb-4">
          To use this features, simply include a message with <span className="text-brand-400 hover:underline" >role: "assistant"</span> at the end of your  <span className="text-brand-400 hover:underline" >messages</span> array.
        </p>

        <CodeBlock language="javascript"
          code={`fetch("http://localhost:8000/api/v1/chat/completions", {
  method: "POST",
  headers: {
    "Authorization": "Bearer YOUR_API_KEY",
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    model: "gemini-1.5-flash",
    messages: [
      { role: "user", content: "What is the meaning of life?" },
      { role: "assistant", content: "I'm not sure, but my best guess is" }
    ]
  })
});`}
        />
      </Card>

      <div className="text-center">
        {/* <Link href="/signup" className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-brand-500 text-white font-medium text-sm hover:bg-brand-600 transition-colors">
          Get Started <ArrowRight size={16} />
        </Link> */}
      </div>
    </div>
  );
}
